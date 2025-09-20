import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFavorites } from '~/composables/useFavorites'
import { ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

// --- Mocks ---
const { useCurrentUserMock } = vi.hoisted(() => ({
  useCurrentUserMock: vi.fn(),
}))
mockNuxtImport('useCurrentUser', () => useCurrentUserMock)

const queryBuilderMock = {
  select: vi.fn(),
  insert: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  range: vi.fn(),
}

const supabaseMock = {
  from: vi.fn(() => queryBuilderMock),
}

const { useSupabaseClientMock } = vi.hoisted(() => ({
  useSupabaseClientMock: vi.fn(() => supabaseMock),
}))
mockNuxtImport('useSupabaseClient', () => useSupabaseClientMock)
// --- End Mocks ---

// --- Test Data ---
const mockUser: User = {
  id: 'user-123',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
}
// --- End Test Data ---

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset chainable mocks to return the builder object itself
    queryBuilderMock.select.mockImplementation(() => queryBuilderMock)
    queryBuilderMock.delete.mockImplementation(() => queryBuilderMock)
    queryBuilderMock.order.mockImplementation(() => queryBuilderMock)

    // Clear implementations for terminating mocks, they will be set in each test
    queryBuilderMock.eq.mockClear()
    queryBuilderMock.insert.mockClear()
    queryBuilderMock.range.mockClear()

    // Reset user mock
    useCurrentUserMock.mockReturnValue({ user: ref(null) })

    // Reset shared state
    const { favorites, loading, error, currentPage, totalPages, totalCount } = useFavorites()
    favorites.value = []
    loading.value = false
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalCount.value = 0
  })

  it('initial state is correct', () => {
    const { favorites, loading, error, currentPage, totalPages, totalCount } = useFavorites()
    expect(favorites.value).toEqual([])
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(currentPage.value).toBe(1)
    expect(totalPages.value).toBe(1)
    expect(totalCount.value).toBe(0)
  })

  describe('isFavorited', () => {
    it('should return false if user is not logged in', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(null) })
      const { isFavorited } = useFavorites()
      const result = await isFavorited(1)
      expect(result).toBe(false)
      expect(supabaseMock.from).not.toHaveBeenCalled()
    })

    it('should return true if the product is favorited', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(mockUser) })
      queryBuilderMock.eq
        .mockImplementationOnce(() => queryBuilderMock) // 1st call returns builder for chaining
        .mockResolvedValueOnce({ data: [{ id: 1 }], error: null }) // 2nd call returns promise

      const { isFavorited } = useFavorites()
      const result = await isFavorited(1)

      expect(result).toBe(true)
      expect(supabaseMock.from).toHaveBeenCalledWith('favorites')
      expect(queryBuilderMock.select).toHaveBeenCalledWith('id')
      expect(queryBuilderMock.eq).toHaveBeenCalledWith('user_id', mockUser.id)
      expect(queryBuilderMock.eq).toHaveBeenCalledWith('product_id', 1)
    })

    it('should return false if the product is not favorited', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(mockUser) })
      queryBuilderMock.eq
        .mockImplementationOnce(() => queryBuilderMock)
        .mockResolvedValueOnce({ data: [], error: null })

      const { isFavorited } = useFavorites()
      const result = await isFavorited(1)
      expect(result).toBe(false)
    })

    it('should return false on database error', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(mockUser) })
      const dbError = new Error('DB error')
      queryBuilderMock.eq
        .mockImplementationOnce(() => queryBuilderMock)
        .mockResolvedValueOnce({ data: null, error: dbError })

      const { isFavorited } = useFavorites()
      const result = await isFavorited(1)
      expect(result).toBe(false)
    })
  })

  describe('addFavorite', () => {
    it('should do nothing if user is not logged in', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(null) })
      const { addFavorite } = useFavorites()
      await addFavorite(1)
      expect(supabaseMock.from).not.toHaveBeenCalled()
    })

    it('should insert a new favorite and then refetch favorites', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(mockUser) })

      // Mock for the insert() call in addFavorite
      queryBuilderMock.insert.mockResolvedValue({ error: null })

      // Mocks for the two DB calls in the subsequent fetchFavoriteProducts()
      queryBuilderMock.eq
        .mockResolvedValueOnce({ count: 1, error: null }) // 1. for the count query
        .mockImplementationOnce(() => queryBuilderMock)     // 2. for the data query (to be chainable)

      queryBuilderMock.range.mockResolvedValue({ data: [], error: null }) // 3. for the end of the data query chain

      const { addFavorite } = useFavorites()
      await addFavorite(1)

      expect(supabaseMock.from).toHaveBeenCalledWith('favorites')
      expect(queryBuilderMock.insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        product_id: 1,
      })
      // Check that fetchFavoriteProducts was effectively called by checking its db calls
      expect(queryBuilderMock.select).toHaveBeenCalledWith('*', { count: 'exact', head: true })
      expect(queryBuilderMock.select).toHaveBeenCalledWith('product:products(*, profiles(username))')
      expect(queryBuilderMock.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should log an error if inserting fails', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(mockUser) })
      const dbError = new Error('Insert failed')
      queryBuilderMock.insert.mockResolvedValue({ error: dbError })
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { addFavorite } = useFavorites()
      await addFavorite(1)

      expect(queryBuilderMock.insert).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error adding to favorites:', dbError)
      // Ensure fetch was not called
      expect(queryBuilderMock.select).not.toHaveBeenCalledWith('*', { count: 'exact', head: true })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('removeFavorite', () => {
    const mockProduct = { id: 1, name: 'Test Product' };

    beforeEach(() => {
      const { favorites } = useFavorites();
      favorites.value = [mockProduct];
    });

    it('should do nothing if user is not logged in', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(null) });
      const { removeFavorite, favorites } = useFavorites();
      await removeFavorite(1);
      expect(supabaseMock.from).not.toHaveBeenCalled();
      expect(favorites.value).toEqual([mockProduct]);
    });

    it('should optimistically remove from list, call delete, and refetch', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(mockUser) });
      const { removeFavorite, favorites } = useFavorites();

      queryBuilderMock.eq
        // For the delete call in removeFavorite
        .mockImplementationOnce(() => queryBuilderMock) // 1. chain user_id
        .mockResolvedValueOnce({ error: null })         // 2. terminate on product_id
        // For the subsequent fetchFavoriteProducts call
        .mockResolvedValueOnce({ count: 0, error: null }) // 3. terminate for count query
        .mockImplementationOnce(() => queryBuilderMock);    // 4. chain for data query

      queryBuilderMock.range.mockResolvedValue({ data: [], error: null });

      const initialFavorites = [...favorites.value];
      const promise = removeFavorite(1);

      // Check optimistic update
      expect(favorites.value).toEqual([]);

      await promise;

      // Check final state after refetch
      expect(favorites.value).toEqual([]);
      expect(supabaseMock.from).toHaveBeenCalledWith('favorites');
      expect(queryBuilderMock.delete).toHaveBeenCalled();
      expect(queryBuilderMock.eq).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(queryBuilderMock.eq).toHaveBeenCalledWith('product_id', 1);
      expect(queryBuilderMock.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    });

    it('should revert optimistic update and log error if delete fails', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(mockUser) });
      const { removeFavorite, favorites } = useFavorites();
      const dbError = new Error('Delete failed');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      queryBuilderMock.eq
        .mockImplementationOnce(() => queryBuilderMock) // 1. chain user_id
        .mockResolvedValueOnce({ error: dbError });    // 2. terminate on product_id with an error

      await removeFavorite(1);

      expect(favorites.value).toEqual([mockProduct]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error removing from favorites:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('fetchFavoriteProducts', () => {
    it('should do nothing if user is not logged in', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(null) });
      const { fetchFavoriteProducts } = useFavorites();
      await fetchFavoriteProducts();
      expect(supabaseMock.from).not.toHaveBeenCalled();
    });

    it('should fetch count and products, and update state correctly', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(mockUser) });
      const mockProducts = [{ id: 2, name: 'Fetched Product' }];
      const { fetchFavoriteProducts, favorites, loading, totalCount, totalPages } = useFavorites();

      queryBuilderMock.eq
        .mockResolvedValueOnce({ count: 1, error: null }) // For the count query
        .mockImplementationOnce(() => queryBuilderMock);    // For the data query chain

      queryBuilderMock.range.mockResolvedValue({ data: [{ product: mockProducts[0] }], error: null });

      const promise = fetchFavoriteProducts();

      expect(loading.value).toBe(true);

      await promise;

      expect(loading.value).toBe(false);
      expect(totalCount.value).toBe(1);
      expect(totalPages.value).toBe(1); // 1 item / 8 per page
      expect(favorites.value).toEqual(mockProducts);
    });

    it('should handle database errors gracefully', async () => {
        useCurrentUserMock.mockReturnValue({ user: ref(mockUser) });
        const dbError = new Error('Fetch failed');
        const { fetchFavoriteProducts, favorites, loading, error } = useFavorites();

        queryBuilderMock.eq.mockResolvedValueOnce({ count: null, error: dbError });

        await fetchFavoriteProducts();

        expect(loading.value).toBe(false);
        expect(error.value).toBe(dbError);
        expect(favorites.value).toEqual([]);
    });
  });
})
