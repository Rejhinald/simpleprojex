'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { 
  templateApi, 
  categoryApi, 
  Template, 
  Category, 
  Variable,
  CreateCategoryRequest,
  CreateVariableRequest,
  CreateElementRequest
} from '../../api/apiService'

export default function TemplateDetailPage() {
  const params = useParams()
  const templateId = Number(params.id)
  
  const [template, setTemplate] = useState<Template | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [variables, setVariables] = useState<Variable[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  const [newCategory, setNewCategory] = useState<CreateCategoryRequest>({ 
    name: '', 
    position: 0 
  })
  
  const [newVariable, setNewVariable] = useState<CreateVariableRequest>({ 
    name: '', 
    type: 'LINEAR_FEET' 
  })
  
  const [newElement, setNewElement] = useState<{
    categoryId: number;
    name: string;
    material_cost: string;
    labor_cost: string;
    markup_percentage: number;
    position: number;
  }>({ 
    categoryId: 0,
    name: '', 
    material_cost: '', 
    labor_cost: '', 
    markup_percentage: 0, 
    position: 0 
  })
  
  useEffect(() => {
    if (!templateId) return
    void loadTemplateData()
  }, [templateId])
  
  const loadTemplateData = async (): Promise<void> => {
    try {
      setLoading(true)
      const templateData = await templateApi.getById(templateId)
      const categoriesData = await templateApi.listCategories(templateId)
      const variablesData = await templateApi.listVariables(templateId)
      
      setTemplate(templateData)
      setCategories(categoriesData)
      setVariables(variablesData)
      
      if (categoriesData.length > 0) {
        setNewElement({...newElement, categoryId: categoriesData[0].id})
      }
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const createCategory = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      await templateApi.createCategory(templateId, newCategory)
      setNewCategory({ name: '', position: 0 })
      void loadTemplateData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }
  
  const createVariable = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      await templateApi.createVariable(templateId, newVariable)
      setNewVariable({ name: '', type: 'LINEAR_FEET' })
      void loadTemplateData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }
  
  const createElement = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!newElement.categoryId) {
      setError('Please select a category')
      return
    }
    
    try {
      const data: CreateElementRequest = {
        name: newElement.name,
        material_cost: newElement.material_cost,
        labor_cost: newElement.labor_cost,
        markup_percentage: newElement.markup_percentage,
        position: newElement.position
      }
      
      await categoryApi.createElement(newElement.categoryId, data)
      setNewElement({ 
        categoryId: newElement.categoryId,
        name: '', 
        material_cost: '', 
        labor_cost: '', 
        markup_percentage: 0, 
        position: 0 
      })
      void loadTemplateData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }
  
  if (loading) return <div>Loading template details...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!template) return <div>Template not found</div>
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{template.name}</h1>
      <p className="text-gray-600">{template.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <form onSubmit={createCategory} className="mb-6 space-y-4">
            <div>
              <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                id="category-name"
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
            <div>
              <label htmlFor="category-position" className="block text-sm font-medium text-gray-700">Position</label>
              <input
                id="category-position"
                type="number"
                value={newCategory.position}
                onChange={(e) => setNewCategory({...newCategory, position: parseInt(e.target.value, 10)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Add Category
            </button>
          </form>
          
          {categories.length === 0 ? (
            <p>No categories found.</p>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="border p-4 rounded">
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-gray-600">Position: {category.position}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Variables Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Variables</h2>
          <form onSubmit={createVariable} className="mb-6 space-y-4">
            <div>
              <label htmlFor="variable-name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                id="variable-name"
                type="text"
                value={newVariable.name}
                onChange={(e) => setNewVariable({...newVariable, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
            <div>
              <label htmlFor="variable-type" className="block text-sm font-medium text-gray-700">Type</label>
              <select
                id="variable-type"
                value={newVariable.type}
                onChange={(e) => setNewVariable({
                  ...newVariable, 
                  type: e.target.value as 'LINEAR_FEET' | 'SQUARE_FEET' | 'CUBIC_FEET' | 'COUNT'
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              >
                <option value="LINEAR_FEET">Linear Feet</option>
                <option value="SQUARE_FEET">Square Feet</option>
                <option value="CUBIC_FEET">Cubic Feet</option>
                <option value="COUNT">Count</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Add Variable
            </button>
          </form>
          
          {variables.length === 0 ? (
            <p>No variables found.</p>
          ) : (
            <div className="space-y-4">
              {variables.map((variable) => (
                <div key={variable.id} className="border p-4 rounded">
                  <h3 className="font-semibold">{variable.name}</h3>
                  <p className="text-gray-600">Type: {variable.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Elements Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Add Element</h2>
        {categories.length === 0 ? (
          <p>Please create a category first before adding elements.</p>
        ) : (
          <form onSubmit={createElement} className="space-y-4">
            <div>
              <label htmlFor="element-category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="element-category"
                value={newElement.categoryId}
                onChange={(e) => setNewElement({...newElement, categoryId: parseInt(e.target.value, 10)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="element-name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                id="element-name"
                type="text"
                value={newElement.name}
                onChange={(e) => setNewElement({...newElement, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
            <div>
              <label htmlFor="element-material" className="block text-sm font-medium text-gray-700">
                Material Cost (formula)
              </label>
              <input
                id="element-material"
                type="text"
                value={newElement.material_cost}
                onChange={(e) => setNewElement({...newElement, material_cost: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
                placeholder="e.g., 'Roof Area * 3.5'"
              />
            </div>
            <div>
              <label htmlFor="element-labor" className="block text-sm font-medium text-gray-700">
                Labor Cost (formula)
              </label>
              <input
                id="element-labor"
                type="text"
                value={newElement.labor_cost}
                onChange={(e) => setNewElement({...newElement, labor_cost: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
                placeholder="e.g., 'Roof Area * 2.25'"
              />
            </div>
            <div>
              <label htmlFor="element-markup" className="block text-sm font-medium text-gray-700">
                Markup Percentage
              </label>
              <input
                id="element-markup"
                type="number"
                value={newElement.markup_percentage}
                onChange={(e) => setNewElement({
                  ...newElement, 
                  markup_percentage: parseInt(e.target.value, 10)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label htmlFor="element-position" className="block text-sm font-medium text-gray-700">Position</label>
              <input
                id="element-position"
                type="number"
                value={newElement.position}
                onChange={(e) => setNewElement({
                  ...newElement, 
                  position: parseInt(e.target.value, 10)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                min="0"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Add Element
            </button>
          </form>
        )}
      </div>
    </div>
  )
}