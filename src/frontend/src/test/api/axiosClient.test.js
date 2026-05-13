import { describe, test, expect, beforeEach, vi } from 'vitest'
import axiosClient from '../../shared/api/axiosClient'

describe('axiosClient', () => {

    // Her testten önce localStorage'ı temizle
    beforeEach(() => {
        localStorage.clear()
    })

    test('token varsa Authorization header eklenir', async () => {
        // localStorage'a token koy
        localStorage.setItem('access_token', 'test-token-123')

        // interceptor'ın config'i nasıl değiştirdiğini test et
        const config = { headers: {} }
        const result = await axiosClient.interceptors.request.handlers[0].fulfilled(config)

        expect(result.headers.Authorization).toBe('Bearer test-token-123')
    })

    test('token yoksa Authorization header eklenmez', async () => {
        // localStorage boş, token yok

        const config = { headers: {} }
        const result = await axiosClient.interceptors.request.handlers[0].fulfilled(config)

        expect(result.headers.Authorization).toBeUndefined()
    })

    test('login isteği 401 alınca interceptor devreye girmez', async () => {
        // Login endpoint'ine giden istek
        const error = {
            config: { url: '/api/auth/token/' },
            response: { status: 401 }
        }

        // Hata direkt fırlatılmalı, yönlendirme olmamalı
        await expect(
            axiosClient.interceptors.response.handlers[0].rejected(error)
        ).rejects.toEqual(error)
    })

})