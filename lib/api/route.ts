/**
 * غلاف موحّد لكل Route Handlers في المشروع.
 * المرجع: PROJECT_SPEC.md القسمان 4 و 5.
 *
 * يفرض بالترتيب على كل مسار:
 *   1. تحديد معدل الطلبات (Rate limiting)
 *   2. التحقق من الهوية (جلسة موثّقة عبر getUser) ومن أن الحساب غير محظور
 *   3. التحقق من الصلاحية الإدارية من admin_roles في السيرفر
 *   4. التحقق من صحة المدخلات بـ Zod قبل لمس قاعدة البيانات
 *   5. شكل استجابة واحد: { success, data } أو { success, error }
 *
 * قاعدة إلزامية: ممنوع كتابة Route Handler خارج هذا الغلاف.
 */
import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import type { ZodType } from 'zod'
import {
  consumeRateLimit,
  getClientIp,
  rateLimitHeaders,
  type RateLimitName,
} from '@/lib/security/rate-limit'
import { HttpError, errors } from '@/lib/security/errors'
import {
  requireAdmin,
  requirePermission,
  requireUser,
  getActor,
  type Actor,
  type AdminActor,
  type Permission,
} from '@/lib/security/guards'
import { apiError, apiSuccess } from '@/types/api'

export type AuthLevel = 'public' | 'user' | 'admin'

type ActorFor<A extends AuthLevel> = A extends 'admin'
  ? AdminActor
  : A extends 'user'
    ? Actor
    : Actor | null

export type RouteContext<A extends AuthLevel, TBody> = {
  request: NextRequest
  /** معاملات المسار الديناميكي، مثل [id] */
  params: Record<string, string>
  /** معاملات البحث في الرابط */
  searchParams: URLSearchParams
  /** جسم الطلب بعد التحقق منه (undefined لو ما فيه schema) */
  body: TBody
  actor: ActorFor<A>
  ip: string
}

export type RouteOptions<A extends AuthLevel, TBody> = {
  /** مستوى الحماية — الافتراضي 'user' حتى لا يُنسى التأمين بالخطأ */
  auth?: A
  /** صلاحية إدارية مطلوبة (تعمل فقط مع auth: 'admin') */
  permission?: Permission
  /** مخطط Zod للتحقق من جسم الطلب */
  schema?: ZodType<TBody>
  /** قاعدة تحديد المعدل من RATE_LIMITS */
  rateLimit?: RateLimitName
}

type NextRouteArgs = { params?: Promise<Record<string, string>> }

function jsonError(error: HttpError) {
  return NextResponse.json(apiError(error.message), {
    status: error.status,
    headers: error.headers,
  })
}

export function createApiRoute<A extends AuthLevel = 'user', TBody = undefined>(
  options: RouteOptions<A, TBody>,
  handler: (context: RouteContext<A, TBody>) => Promise<unknown>,
) {
  const authLevel = (options.auth ?? 'user') as AuthLevel

  return async function route(request: NextRequest, args?: NextRouteArgs) {
    try {
      const ip = getClientIp(request)

      // 1) تحديد المعدل حسب IP قبل أي عمل (يحمي المسارات العامة والمصادقة)
      let limitHeaders: Record<string, string> = {}
      if (options.rateLimit) {
        const result = consumeRateLimit(options.rateLimit, `ip:${ip}`)
        limitHeaders = rateLimitHeaders(result)
        if (!result.allowed) throw errors.tooManyRequests(result.retryAfterSeconds)
      }

      // 2 و 3) الهوية والصلاحية
      let actor: Actor | null = null
      if (authLevel === 'admin') {
        actor = options.permission ? await requirePermission(options.permission) : await requireAdmin()
      } else if (authLevel === 'user') {
        actor = await requireUser()
      } else {
        actor = await getActor()
        if (actor?.profile?.is_banned) throw errors.banned()
      }

      // تحديد المعدل مرة ثانية لكل مستخدم (منع الالتفاف بتغيير IP)
      if (options.rateLimit && actor) {
        const result = consumeRateLimit(options.rateLimit, `user:${actor.userId}`)
        limitHeaders = rateLimitHeaders(result)
        if (!result.allowed) throw errors.tooManyRequests(result.retryAfterSeconds)
      }

      // 4) التحقق من المدخلات
      let body = undefined as TBody
      if (options.schema) {
        let raw: unknown
        try {
          raw = await request.json()
        } catch {
          throw errors.badRequest('جسم الطلب يجب أن يكون JSON صالحاً.')
        }
        const parsed = options.schema.safeParse(raw)
        if (!parsed.success) {
          const first = parsed.error.issues[0]
          throw errors.invalidInput(first?.message || 'البيانات المُرسلة غير صحيحة.')
        }
        body = parsed.data
      }

      const url = new URL(request.url)
      const params = args?.params ? await args.params : {}

      const data = await handler({
        request,
        params,
        searchParams: url.searchParams,
        body,
        actor: actor as ActorFor<A>,
        ip,
      })

      return NextResponse.json(apiSuccess(data ?? null), {
        headers: { ...limitHeaders, 'Cache-Control': 'no-store' },
      })
    } catch (error) {
      if (error instanceof HttpError) return jsonError(error)

      // أي خطأ غير متوقع: يُسجَّل في السيرفر ولا تُكشف تفاصيله للعميل
      console.error('[v0] api route failure:', error)
      return jsonError(errors.internal())
    }
  }
}
