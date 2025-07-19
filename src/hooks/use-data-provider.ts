import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { BaseFilterParams, CrudOperations } from '@/types/data-provider'

// Generic query keys factory
export function createQueryKeys(entityName: string) {
  return {
    all: [entityName] as const,
    lists: () => [...entityName, 'list'] as const,
    list: (filters: BaseFilterParams) => [...entityName, 'list', filters] as const,
    details: () => [...entityName, 'detail'] as const,
    detail: (id: string) => [...entityName, 'detail', id] as const
  }
}

// Generic hooks factory
export function createDataHooks<
  T,
  TDetail,
  TCreateData,
  TUpdateData,
  TFilterParams extends BaseFilterParams
>(
  entityName: string,
  operations: CrudOperations<T, TDetail, TCreateData, TUpdateData>,
  translationNamespace: string = entityName
) {
  const queryKeys = createQueryKeys(entityName)

  // Hook untuk fetch items dengan filters
  function useItems(filters: TFilterParams) {
    return useQuery({
      queryKey: queryKeys.list(filters),
      queryFn: () => operations.fetchItems(filters),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2
    })
  }

  // Hook untuk fetch item detail
  function useItemDetail(id: string, enabled: boolean = true) {
    return useQuery({
      queryKey: queryKeys.detail(id),
      queryFn: () => operations.fetchItemDetail(id),
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2
    })
  }

  // Hook untuk create item
  function useCreateItem() {
    const queryClient = useQueryClient()
    const { t } = useTranslation([translationNamespace])

    return useMutation({
      mutationFn: operations.createItem,
      onSuccess: (response) => {
        if (response.success) {
          toast.success(t(`${translationNamespace}.form.createSuccess`), {
            description: t(`${translationNamespace}.form.createSuccessDescription`)
          })

          // Invalidate and refetch items list
          queryClient.invalidateQueries({ queryKey: queryKeys.lists() })
        } else {
          toast.error(t(`${translationNamespace}.form.createError`), {
            description: response.message || t(`${translationNamespace}.form.errorDefault`)
          })
        }
      },
      onError: (error) => {
        console.error(`Error creating ${entityName}:`, error)
        toast.error(t(`${translationNamespace}.form.createError`), {
          description: t(`${translationNamespace}.form.errorDefault`)
        })
      }
    })
  }

  // Hook untuk update item
  function useUpdateItem() {
    const queryClient = useQueryClient()
    const { t } = useTranslation([translationNamespace])

    return useMutation({
      mutationFn: operations.updateItem,
      onSuccess: (response, variables) => {
        if (response.success) {
          toast.success(t(`${translationNamespace}.form.updateSuccess`), {
            description: t(`${translationNamespace}.form.updateSuccessDescription`)
          })

          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: queryKeys.lists() })
          queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) })
        } else {
          toast.error(t(`${translationNamespace}.form.updateError`), {
            description: response.message || t(`${translationNamespace}.form.errorDefault`)
          })
        }
      },
      onError: (error) => {
        console.error(`Error updating ${entityName}:`, error)
        toast.error(t(`${translationNamespace}.form.updateError`), {
          description: t(`${translationNamespace}.form.errorDefault`)
        })
      }
    })
  }

  // Hook untuk delete item
  function useDeleteItem() {
    const queryClient = useQueryClient()
    const { t } = useTranslation([translationNamespace])

    return useMutation({
      mutationFn: ({ id }: { id: string; itemName?: string }) => operations.deleteItem(id),
      onSuccess: (response) => {
        if (response.success) {
          toast.success(t(`${translationNamespace}.messages.deleteSuccess`), {
            description: t(`${translationNamespace}.messages.deleteSuccessDescription`)
          })

          // Invalidate and refetch items list
          queryClient.invalidateQueries({ queryKey: queryKeys.lists() })
        } else {
          toast.error(t(`${translationNamespace}.messages.deleteError`), {
            description:
              response.message || t(`${translationNamespace}.messages.deleteErrorDescription`)
          })
        }
      },
      onError: (error) => {
        console.error(`Error deleting ${entityName}:`, error)
        toast.error(t(`${translationNamespace}.messages.deleteError`), {
          description: t(`${translationNamespace}.messages.deleteErrorDescription`)
        })
      }
    })
  }

  return {
    queryKeys,
    useItems,
    useItemDetail,
    useCreateItem,
    useUpdateItem,
    useDeleteItem
  }
}
