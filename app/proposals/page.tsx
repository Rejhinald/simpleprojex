'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  proposalApi, 
  templateApi, 
  Template, 
  Proposal, 
  CreateProposalFromTemplateRequest,
  CreateProposalFromScratchRequest} from '../api/apiService'

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  const [newProposalTemplate, setNewProposalTemplate] = useState<CreateProposalFromTemplateRequest>({
    name: '',
    template_id: 0,
    global_markup_percentage: 15
  })
  
  const [newProposalScratch, setNewProposalScratch] = useState<CreateProposalFromScratchRequest>({
    name: '',
    global_markup_percentage: 15
  })
  
  useEffect(() => {
    void loadData()
  }, [])
  
  const loadData = async (): Promise<void> => {
    try {
      setLoading(true)
      const [proposalsData, templatesData] = await Promise.all([
        proposalApi.list(),
        templateApi.list()
      ])
      
      setProposals(proposalsData.items || [])
      setTemplates(templatesData.items || [])
      
      if ((templatesData.items?.length ?? 0) > 0) {
        const firstTemplate = templatesData.items[0]
        setNewProposalTemplate({
          ...newProposalTemplate,
          template_id: firstTemplate.id
        })
      }
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const createProposalFromTemplate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      await proposalApi.createFromTemplate(newProposalTemplate)
      setNewProposalTemplate({
        name: '',
        template_id: templates.length > 0 ? templates[0].id : 0,
        global_markup_percentage: 15
      })
      void loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }
  
  const createProposalFromScratch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      await proposalApi.createFromScratch(newProposalScratch)
      setNewProposalScratch({
        name: '',
        global_markup_percentage: 15
      })
      void loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }
  
  const deleteProposal = async (id: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      try {
        await proposalApi.delete(id)
        void loadData()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      }
    }
  }
  
  if (loading) return <div>Loading proposals...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Proposals</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create from Template */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create From Template</h2>
          {templates.length === 0 ? (
            <p>No templates available. Please create a template first.</p>
          ) : (
            <form onSubmit={createProposalFromTemplate} className="space-y-4">
              <div>
                <label htmlFor="proposal-name-template" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  id="proposal-name-template"
                  type="text"
                  value={newProposalTemplate.name}
                  onChange={(e) => setNewProposalTemplate({...newProposalTemplate, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  required
                />
              </div>
              <div>
                <label htmlFor="proposal-template" className="block text-sm font-medium text-gray-700">Template</label>
                <select
                  id="proposal-template"
                  value={newProposalTemplate.template_id}
                  onChange={(e) => setNewProposalTemplate({
                    ...newProposalTemplate, 
                    template_id: parseInt(e.target.value, 10)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  required
                >
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="proposal-markup-template" className="block text-sm font-medium text-gray-700">
                  Global Markup %
                </label>
                <input
                  id="proposal-markup-template"
                  type="number"
                  value={newProposalTemplate.global_markup_percentage}
                  onChange={(e) => setNewProposalTemplate({
                    ...newProposalTemplate, 
                    global_markup_percentage: parseInt(e.target.value, 10)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  min="0"
                  max="100"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Create Proposal
              </button>
            </form>
          )}
        </div>
        
        {/* Create from Scratch */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create From Scratch</h2>
          <form onSubmit={createProposalFromScratch} className="space-y-4">
            <div>
              <label htmlFor="proposal-name-scratch" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                id="proposal-name-scratch"
                type="text"
                value={newProposalScratch.name}
                onChange={(e) => setNewProposalScratch({...newProposalScratch, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
            <div>
              <label htmlFor="proposal-markup-scratch" className="block text-sm font-medium text-gray-700">
                Global Markup %
              </label>
              <input
                id="proposal-markup-scratch"
                type="number"
                value={newProposalScratch.global_markup_percentage}
                onChange={(e) => setNewProposalScratch({
                  ...newProposalScratch, 
                  global_markup_percentage: parseInt(e.target.value, 10)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                min="0"
                max="100"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Create Proposal
            </button>
          </form>
        </div>
      </div>
      
      {/* Proposal List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Proposal List</h2>
        {proposals.length === 0 ? (
          <p>No proposals found.</p>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{proposal.name}</h3>
                  <p className="text-sm text-gray-500">Created: {new Date(proposal.created_at).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">
                    Global Markup: {proposal.global_markup_percentage}% | 
                    Template: {proposal.template_id ? `#${proposal.template_id}` : 'None'}
                  </p>
                </div>
                <div className="space-x-2">
                  <Link 
                    href={`/proposals/${proposal.id}`}
                    className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                  <button 
                    onClick={() => void deleteProposal(proposal.id)}
                    className="bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700"
                    aria-label={`Delete proposal ${proposal.name}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}