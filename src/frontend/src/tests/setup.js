import * as matchers from '@testing-library/jest-dom/matchers';
import { expect, vi } from 'vitest';

expect.extend(matchers);

// API Servislerini global olarak merkezileştirilmiş şekilde mock'luyoruz.
// Böylece watch mode (izleme modu) çalışırken farklı test dosyalarındaki
// kısmi mock tanımları birbirini ezmez ve yavaşlama/timeout hataları oluşmaz.

vi.mock('../shared/api/studentService', () => ({
    default: {
        getProfil: vi.fn(),
        getDersler: vi.fn(),
        getMevcutDersler: vi.fn(),
        getAktifDonem: vi.fn(),
        dersKaydet: vi.fn(),
        dersSil: vi.fn(),
        getTranskript: vi.fn(),
        indirTranskriptPDF: vi.fn()
    }
}));

vi.mock('../shared/api/academicianService.js', () => ({
    default: {
        getProfil: vi.fn(),
        getDersler: vi.fn(),
        getKayitIstekleri: vi.fn(),
        getDersOgrencileri: vi.fn(),
        notGir: vi.fn(),
        onaylaKayit: vi.fn(),
        reddetKayit: vi.fn()
    }
}));

vi.mock('../shared/api/authServices', () => ({
    default: {
        login: vi.fn()
    }
}));