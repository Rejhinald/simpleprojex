'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { contractApi, Contract, PaginatedResponse, SignContractRequest } from '../api/apiService'

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    void loadContracts()
  }, [])
  
  const loadContracts = async (): Promise<void> => {
    try {
      setLoading(true)
      const data: PaginatedResponse<Contract> = await contractApi.list()
      setContracts(data.items || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const signContract = async (contractId: number, type: 'client' | 'contractor', initials: string): Promise<void> => {
    try {
      const data: SignContractRequest = { initials }
      
      if (type === 'client') {
        await contractApi.clientSign(contractId, data)
      } else {
        await contractApi.contractorSign(contractId, data)
      }
      
      void loadContracts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }
  
  if (loading) return <div>Loading contracts...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Contracts</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Contract List</h2>
        {contracts.length === 0 ? (
          <div>
            <p>No contracts found.</p>
            <p className="mt-4">
              To create a contract, go to a proposal detail page and use the Generate Contract form.
            </p>
            <Link href="/proposals" className="text-blue-600 hover:underline">
              View Proposals
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div key={contract.id} className="border p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Contract #{contract.id}</h3>
                    <p>Proposal ID: {contract.proposal_id}</p>
                    <p className="text-sm text-gray-500">Created: {new Date(contract.created_at).toLocaleString()}</p>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold">Client:</p>
                        <p>{contract.client_name}</p>
                        <p className="text-sm">
                          Initials: {contract.client_initials || 'Not signed'}
                        </p>
                        <p className="text-sm">
                          {contract.client_signed_at ? 
                            `Signed: ${new Date(contract.client_signed_at).toLocaleString()}` : 
                            'Not signed yet'}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold">Contractor:</p>
                        <p>{contract.contractor_name}</p>
                        <p className="text-sm">
                          Initials: {contract.contractor_initials || 'Not signed'}
                        </p>
                        <p className="text-sm">
                          {contract.contractor_signed_at ? 
                            `Signed: ${new Date(contract.contractor_signed_at).toLocaleString()}` : 
                            'Not signed yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Link 
                      href={`/contracts/${contract.id}`}
                      className="block bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 text-center"
                    >
                      View Details
                    </Link>
                    
                    {!contract.client_signed_at && (
                      <button 
                        onClick={() => void signContract(contract.id, 'client', contract.client_initials)}
                        className="block w-full bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700"
                        aria-label={`Client sign for contract #${contract.id}`}
                      >
                        Client Sign
                      </button>
                    )}
                    
                    {!contract.contractor_signed_at && (
                      <button 
                        onClick={() => void signContract(contract.id, 'contractor', contract.contractor_initials)}
                        className="block w-full bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700"
                        aria-label={`Contractor sign for contract #${contract.id}`}
                      >
                        Contractor Sign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}