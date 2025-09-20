import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSupabaseHelpers } from '~/composables/useSupabaseHelpers'
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

// --- Mocks ---
const getPublicUrlMock = vi.fn();
const fromMock = vi.fn(() => ({ getPublicUrl: getPublicUrlMock }));
const supabaseStorageMock = { from: fromMock };
const supabaseClientMock = { storage: supabaseStorageMock };

const { useSupabaseClientMock } = vi.hoisted(() => ({
    useSupabaseClientMock: vi.fn(() => supabaseClientMock)
}));
mockNuxtImport('useSupabaseClient', () => useSupabaseClientMock);
// --- End Mocks ---


describe('useSupabaseHelpers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Further tests will go here
    describe('getPathFromUrl', () => {
        const { getPathFromUrl } = useSupabaseHelpers();

        it('should extract path from a valid Supabase URL', () => {
            const url = 'https://xyz.supabase.co/storage/v1/object/public/assets/products/image.png';
            expect(getPathFromUrl(url)).toBe('products/image.png');
        });

        it('should return null for non-asset URLs', () => {
            const url = 'https://example.com/foo/bar/image.png';
            expect(getPathFromUrl(url)).toBeNull();
        });

        it('should return null for invalid URL strings', () => {
            const url = 'not-a-valid-url';
            expect(getPathFromUrl(url)).toBeNull();
        });

        it('should return null for a null input', () => {
            expect(getPathFromUrl(null)).toBeNull();
        });

        it('should handle URLs with query parameters', () => {
            const url = 'https://xyz.supabase.co/storage/v1/object/public/assets/products/image.png?token=123';
            expect(getPathFromUrl(url)).toBe('products/image.png');
        })
    });

    describe('getOptimizedPublicUrl', () => {
        const { getOptimizedPublicUrl } = useSupabaseHelpers();

        beforeEach(() => {
            // Reset the mock before each test in this block
            getPublicUrlMock.mockClear();
        });

        it('should call getPublicUrl with correct path and options', () => {
            const path = 'products/image.png';
            const options = { width: 100, height: 100, resize: 'contain' as const };
            getPublicUrlMock.mockReturnValue({ data: { publicUrl: 'http://example.com/optimized-url' } });

            const result = getOptimizedPublicUrl(path, options);

            expect(getPublicUrlMock).toHaveBeenCalledWith(path, {
                transform: {
                    width: 100,
                    height: 100,
                    resize: 'contain',
                },
            });
            expect(result).toBe('http://example.com/optimized-url');
        });

        it('should default resize option to "cover"', () => {
            const path = 'products/image.png';
            const options = { width: 100, height: 100 }; // No resize option

            getOptimizedPublicUrl(path, options);

            expect(getPublicUrlMock).toHaveBeenCalledWith(path, {
                transform: {
                    width: 100,
                    height: 100,
                    resize: 'cover',
                },
            });
        });

        it('should return null if path is null', () => {
            const options = { width: 100, height: 100 };
            const result = getOptimizedPublicUrl(null, options);
            expect(result).toBeNull();
            expect(getPublicUrlMock).not.toHaveBeenCalled();
        });
    });
});
