'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { 
  contractApi, 
  proposalApi, 
  Contract, 
  Proposal, 
  ElementValue, 
  SignContractRequest 
} from '../../api/apiService'

export default function ContractDetailPage() {
  const params = useParams()
  const contractId = Number(params.id)
  
  const [contract, setContract] = useState<Contract | null>(null)
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [elementValues, setElementValues] = useState<ElementValue[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (!contractId) return
    void loadContractData()
  }, [contractId])
  
  const loadContractData = async (): Promise<void> => {
    try {
      setLoading(true)
      const contractData = await contractApi.getById(contractId)
      setContract(contractData)
      
      if (contractData.proposal_id) {
        const proposalData = await proposalApi.getById(contractData.proposal_id)
        setProposal(proposalData)
        
        const elementValuesData = await proposalApi.getElementValues(contractData.proposal_id)
        setElementValues(elementValuesData)
      }
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const signContract = async (type: 'client' | 'contractor'): Promise<void> => {
    if (!contract) return
    
    const promptText = type === 'client' 
      ? `Enter ${contract.client_name}'s initials:` 
      : `Enter ${contract.contractor_name}'s initials:`
      
    const defaultValue = type === 'client' ? contract.client_initials : contract.contractor_initials
    
    const initials = window.prompt(promptText, defaultValue)
    
    if (!initials) return
    
    try {
      const data: SignContractRequest = { initials }
      
      if (type === 'client') {
        await contractApi.clientSign(contractId, data)
      } else {
        await contractApi.contractorSign(contractId, data)
      }
      
      void loadContractData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }
  
  if (loading) return <div>Loading contract details...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!contract) return <div>Contract not found</div>
  
  // Calculate totals from element values
  const totalMaterial = elementValues.reduce((sum, element) => 
    sum + parseFloat(element.calculated_material_cost), 0)
  const totalLabor = elementValues.reduce((sum, element) => 
    sum + parseFloat(element.calculated_labor_cost), 0)
  const totalAfterMarkup = elementValues.reduce((sum, element) => 
    sum + (element.total_with_markup ?? 0), 0)
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contract #{contract.id}</h1>
        
        <div className="space-x-2">
          {!contract.client_signed_at && (
            <button 
              onClick={() => void signContract('client')}
              className="bg-green-600 text-white py-1 px-4 rounded hover:bg-green-700"
            >
              Client Sign
            </button>
          )}
          
          {!contract.contractor_signed_at && (
            <button 
              onClick={() => void signContract('contractor')}
              className="bg-green-600 text-white py-1 px-4 rounded hover:bg-green-700"
            >
              Contractor Sign
            </button>
          )}
          
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700"
          >
            Print
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md print:shadow-none">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold uppercase">CONSTRUCTION CONTRACT</h2>
          <p className="text-lg">{proposal?.name || 'Contract'}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-lg border-b pb-1 mb-2">Client Information</h3>
            <p><strong>Name:</strong> {contract.client_name}</p>
            {contract.client_signed_at && (
              <p>
                <strong>Signed:</strong> {new Date(contract.client_signed_at).toLocaleString()}
                <span className="ml-2">({contract.client_initials})</span>
              </p>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-lg border-b pb-1 mb-2">Contractor Information</h3>
            <p><strong>Name:</strong> {contract.contractor_name}</p>
            {contract.contractor_signed_at && (
              <p>
                <strong>Signed:</strong> {new Date(contract.contractor_signed_at).toLocaleString()}
                <span className="ml-2">({contract.contractor_initials})</span>
              </p>
            )}
          </div>
        </div>
        
        {elementValues.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg border-b pb-1 mb-2">Project Scope and Pricing</h3>
            <table className="w-full mt-3">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Item</th>
                  <th className="text-right p-2">Material</th>
                  <th className="text-right p-2">Labor</th>
                  <th className="text-right p-2">Markup</th>
                  <th className="text-right p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {elementValues.map((element) => (
                  <tr key={element.element_id} className="border-b">
                    <td className="p-2">
                      <div className="font-semibold">{element.element_name}</div>
                      <div className="text-sm text-gray-600">{element.category_name}</div>
                    </td>
                    <td className="p-2 text-right">${parseFloat(element.calculated_material_cost).toFixed(2)}</td>
                    <td className="p-2 text-right">${parseFloat(element.calculated_labor_cost).toFixed(2)}</td>
                    <td className="p-2 text-right">{element.markup_percentage}%</td>
                    <td className="p-2 text-right font-semibold">${(element.total_with_markup ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={1} className="p-2 text-left font-medium">Subtotals:</td>
                  <td className="p-2 text-right">${totalMaterial.toFixed(2)}</td>
                  <td className="p-2 text-right">${totalLabor.toFixed(2)}</td>
                  <td className="p-2"></td>
                  <td className="p-2"></td>
                </tr>
                <tr className="bg-gray-100">
                  <td colSpan={4} className="p-2 text-right font-semibold">Total with Markup:</td>
                  <td className="p-2 text-right font-bold">${totalAfterMarkup.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="font-semibold text-lg border-b pb-1 mb-2">Terms and Conditions</h3>
          <div className="whitespace-pre-line">
            {contract.terms_and_conditions}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="border-t pt-4">
            <p className="mb-1">Client Signature:</p>
            <div className="h-16 border-b border-dashed flex items-end justify-center">
              {contract.client_signed_at && (
                <p className="italic">{contract.client_initials}</p>
              )}
            </div>
            <p className="mt-1">Date: {contract.client_signed_at ? 
              new Date(contract.client_signed_at).toLocaleDateString() : '________________'}</p>
          </div>
          
          <div className="border-t pt-4">
            <p className="mb-1">Contractor Signature:</p>
            <div className="h-16 border-b border-dashed flex items-end justify-center">
              {contract.contractor_signed_at && (
                <p className="italic">{contract.contractor_initials}</p>
              )}
            </div>
            <p className="mt-1">Date: {contract.contractor_signed_at ? 
              new Date(contract.contractor_signed_at).toLocaleDateString() : '________________'}</p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-sm print:mt-16">
          <p>Contract generated on {new Date(contract.created_at).toLocaleString()}</p>
          <p>Contract ID: {contract.id} | Proposal ID: {contract.proposal_id}</p>
        </div>
      </div>
    </div>
  )
}