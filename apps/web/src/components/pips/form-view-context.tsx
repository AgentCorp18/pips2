'use client'

import { createContext, useContext } from 'react'

export type FormMode = 'view' | 'edit'

const FormViewContext = createContext<FormMode>('edit')

export const FormViewProvider = FormViewContext.Provider

export const useFormViewMode = (): FormMode => useContext(FormViewContext)
