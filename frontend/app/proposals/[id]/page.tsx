'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { 
  proposalApi, 
  Proposal, 
  VariableValue, 
  ElementValue, 
  GenerateContractRequest,
  SetVariableValueRequest,
  UpdateElementValueRequest
} from '../../api/apiService'

export default function ProposalDetailPage() {
  const params = useParams()
  const proposalId = Number(params.id)
  
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [variableValues, setVariableValues] = useState<VariableValue[]>([])
  const [elementValues, setElementValues] = useState<ElementValue[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  const [contractData, setContractData] = useState<GenerateContractRequest>({
    client_name: '',
    client_initials: '',
    contractor_name: '',
    contractor_initials: '',
    terms_and_conditions: ''
  })
  
  useEffect(() => {
    if (!proposalId) return
    void loadProposalData()
  }, [proposalId])
  
  const loadProposalData = async (): Promise<void> => {
    try {
      setLoading(true)
      const proposalData = await proposalApi.getById(proposalId)
      const variableValuesData = await proposalApi.getVariableValues(proposalId)
      const elementValuesData = await proposalApi.getElementValues(proposalId)
      
      setProposal(proposalData)
      setVariableValues(variableValuesData)
      setElementValues(elementValuesData)
      
      // Set default terms and conditions
      setContractData({
        ...contractData,
        terms_and_conditions: 
          "1. All work to be completed within 45 days of start date.\n" +
          "2. Payment schedule: 30% deposit, 40% at framing completion, 30% upon final inspection.\n" +
          "3. Warranty: 1 year on labor, manufacturer warranties on materials.\n" +
          "4. Change orders must be approved in writing before work begins."
      })
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const updateVariableValue = async (variableId: number, value: number): Promise<void> => {
    try {
      const data: SetVariableValueRequest[] = [{ variable_id: variableId, value }]
      await proposalApi.setVariableValues(proposalId, data)
      void loadProposalData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }
  
  const updateElementValue = async (
    elementId: number, 
    changes: {
      material_cost?: number;
      labor_cost?: number;
      markup_percentage?: number;
    }
  ): Promise<void> => {
    try {
      // Find current element
      const element = elementValues.find(el => el.element_id === elementId)
      if (!element) return
      
      const data: UpdateElementValueRequest[] = [{ 
        element_id: elementId,
        calculated_material_cost: changes.material_cost !== undefined ? 
          changes.material_cost : parseFloat(element.calculated_material_cost),
        calculated_labor_cost: changes.labor_cost !== undefined ? 
          changes.labor_cost : parseFloat(element.calculated_labor_cost),
        markup_percentage: changes.markup_percentage !== undefined ? 
          changes.markup_percentage : parseFloat(element.markup_percentage),
      }]
      
      await proposalApi.updateElementValues(proposalId, data)
      void loadProposalData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }
  
  const generateContract = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      await proposalApi.generateContract(proposalId, contractData)
      window.alert('Contract generated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }
  
  if (loading) return <div>Loading proposal details...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!proposal) return <div>Proposal not found</div>
  
  // Calculate totals
  const totalMaterial = elementValues.reduce((sum, element) => 
    sum + parseFloat(element.calculated_material_cost), 0)
  const totalLabor = elementValues.reduce((sum, element) => 
    sum + parseFloat(element.calculated_labor_cost), 0)
  const totalBeforeMarkup = totalMaterial + totalLabor
  const totalAfterMarkup = elementValues.reduce((sum, element) => 
    sum + (element.total_with_markup ?? 0), 0)
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{proposal.name}</h1>
      <p className="text-gray-600">
        Global Markup: {proposal.global_markup_percentage}% | 
        Template: {proposal.template_id ? `#${proposal.template_id}` : 'None'} |
        Created: {new Date(proposal.created_at).toLocaleString()}
      </p>
      
      {/* Variable Values */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Variable Values</h2>
        {variableValues.length === 0 ? (
          <p>No variables available for this proposal.</p>
        ) : (
          <div className="space-y-4">
            {variableValues.map((variable) => (
              <div key={variable.variable_id} className="border p-4 rounded">
                <h3 className="font-semibold">{variable.variable_name}</h3>
                <p className="text-gray-600">Type: {variable.variable_type}</p>
                <div className="mt-2 flex items-center">
                  <input
                    type="number"
                    value={variable.value}
                    onChange={(e) => updateVariableValue(
                      variable.variable_id, 
                      parseFloat(e.target.value)
                    )}
                    className="block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    step="0.01"
                    aria-label={`Value for ${variable.variable_name}`}
                  />
                  <button
                    onClick={() => void updateVariableValue(
                      variable.variable_id, 
                      variable.value
                    )}
                    className="ml-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Element Values */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Element Values</h2>
        {elementValues.length === 0 ? (
          <p>No elements available for this proposal.</p>
        ) : (
          <div className="space-y-6">
            {elementValues.map((element) => (
              <div key={element.element_id} className="border p-4 rounded">
                <h3 className="font-semibold">{element.element_name}</h3>
                <p className="text-gray-600">Category: {element.category_name}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div>
                    <label 
                      htmlFor={`material-cost-${element.element_id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Material Cost
                    </label>
                    <input
                      id={`material-cost-${element.element_id}`}
                      type="number"
                      value={element.calculated_material_cost}
                      onChange={(e) => void updateElementValue(
                        element.element_id, 
                        { material_cost: parseFloat(e.target.value) }
                      )}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label 
                      htmlFor={`labor-cost-${element.element_id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Labor Cost
                    </label>
                    <input
                      id={`labor-cost-${element.element_id}`}
                      type="number"
                      value={element.calculated_labor_cost}
                      onChange={(e) => void updateElementValue(
                        element.element_id, 
                        { labor_cost: parseFloat(e.target.value) }
                      )}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label 
                      htmlFor={`markup-${element.element_id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Markup %
                    </label>
                    <input
                      id={`markup-${element.element_id}`}
                      type="number"
                      value={element.markup_percentage}
                      onChange={(e) => void updateElementValue(
                        element.element_id, 
                        { markup_percentage: parseFloat(e.target.value) }
                      )}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div className="mt-3 text-right">
                  <p className="text-gray-600">
                    Total: ${(element.total_cost ?? 0).toFixed(2)}
                  </p>
                  <p className="font-semibold">
                    With Markup: ${(element.total_with_markup ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold text-xl mb-2">Proposal Totals</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Total Material Cost:</span>
                  <span>${totalMaterial.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Labor Cost:</span>
                  <span>${totalLabor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal Before Markup:</span>
                  <span>${totalBeforeMarkup.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>TOTAL (with markup):</span>
                  <span>${totalAfterMarkup.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Generate Contract */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Generate Contract</h2>
        <form onSubmit={generateContract} className="space-y-4">
          <div>
            <label htmlFor="client-name" className="block text-sm font-medium text-gray-700">Client Name</label>
            <input
              id="client-name"
              type="text"
              value={contractData.client_name}
              onChange={(e) => setContractData({...contractData, client_name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>
          <div>
            <label htmlFor="client-initials" className="block text-sm font-medium text-gray-700">Client Initials</label>
            <input
              id="client-initials"
              type="text"
              value={contractData.client_initials}
              onChange={(e) => setContractData({...contractData, client_initials: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              maxLength={10}
            />
          </div>
          <div>
            <label htmlFor="contractor-name" className="block text-sm font-medium text-gray-700">Contractor Name</label>
            <input
              id="contractor-name"
              type="text"
              value={contractData.contractor_name}
              onChange={(e) => setContractData({...contractData, contractor_name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>
          <div>
            <label htmlFor="contractor-initials" className="block text-sm font-medium text-gray-700">
              Contractor Initials
            </label>
            <input
              id="contractor-initials"
              type="text"
              value={contractData.contractor_initials}
              onChange={(e) => setContractData({...contractData, contractor_initials: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              maxLength={10}
            />
          </div>
          <div>
            <label htmlFor="terms-conditions" className="block text-sm font-medium text-gray-700">
              Terms and Conditions
            </label>
            <textarea
              id="terms-conditions"
              value={contractData.terms_and_conditions}
              onChange={(e) => setContractData({...contractData, terms_and_conditions: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              rows={6}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Generate Contract
          </button>
        </form>
      </div>
    </div>
  )
}