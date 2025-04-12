"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shared"
import { TooltipProvider } from "@/providers/tooltip-provider"
import { templates } from "@/data/templates"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Import all modularized components
import {
  STORAGE_KEYS,
  VariableValue,
  CostPreview,
  ProposalDetails,
  MarkupSettings,
  VariablesTab,
  CategoriesTab,
  ElementsTab,
  PreviewTab,
} from "./component"

// Import the new StepIndicator component
import { StepIndicator } from "./component/step-indicator"

export interface CreateProposalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define steps
const STEPS = [
  { id: "details", label: "Details" },
  { id: "variables", label: "Variables" },
  { id: "categories", label: "Categories" },
  { id: "elements", label: "Elements" },
  { id: "preview", label: "Preview" }
]

export default function CreateProposalModal({ open, onOpenChange }: CreateProposalModalProps) {
  // Main state
  const [useTemplate, setUseTemplate] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [editingEnabled, setEditingEnabled] = useState(false)
  const [useGlobalMarkup, setUseGlobalMarkup] = useState(true)
  const [globalMarkup, setGlobalMarkup] = useState(15)
  const [elementMarkups, setElementMarkups] = useState<Record<number, number>>({})
  const [laborRates, setLaborRates] = useState<Record<number, string>>({})

  // Variable and formula state
  const [variableValues, setVariableValues] = useState<Record<number, VariableValue>>({})
  const [showSuggestions, setShowSuggestions] = useState<Record<number, boolean>>({})
  const [costPreviews, setCostPreviews] = useState<CostPreview[]>([])

  // Form data
  const [proposalName, setProposalName] = useState("")
  const [proposalDescription, setProposalDescription] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")

  // Get the selected template
  const selectedTemplateData = selectedTemplate ? templates.find((t) => t.id === selectedTemplate) : null

  // Save to localStorage whenever important state changes
  useEffect(() => {
    if (open) {
      // Only save when modal is open to prevent overwriting data
      localStorage.setItem(STORAGE_KEYS.PROPOSAL_DATA, JSON.stringify({
        proposalName,
        proposalDescription,
        clientName,
        clientEmail,
        clientPhone,
        useTemplate,
        useGlobalMarkup,
        globalMarkup,
        currentStep
      }))
      
      localStorage.setItem(STORAGE_KEYS.TEMPLATE_ID, JSON.stringify(selectedTemplate))
      localStorage.setItem(STORAGE_KEYS.VARIABLES, JSON.stringify(variableValues))
      localStorage.setItem(STORAGE_KEYS.MARKUPS, JSON.stringify(elementMarkups))
      localStorage.setItem(STORAGE_KEYS.LABOR_RATES, JSON.stringify(laborRates))
    }
  }, [
    open, proposalName, proposalDescription, clientName, clientEmail, clientPhone, 
    useTemplate, selectedTemplate, useGlobalMarkup, globalMarkup, currentStep,
    variableValues, elementMarkups, laborRates
  ])

  // Load from localStorage when modal opens
  useEffect(() => {
    if (open) {
      try {
        // Load basic form data
        const savedData = localStorage.getItem(STORAGE_KEYS.PROPOSAL_DATA)
        if (savedData) {
          const data = JSON.parse(savedData)
          setProposalName(data.proposalName || "")
          setProposalDescription(data.proposalDescription || "")
          setClientName(data.clientName || "")
          setClientEmail(data.clientEmail || "")
          setClientPhone(data.clientPhone || "")
          setUseTemplate(data.useTemplate !== undefined ? data.useTemplate : true)
          setUseGlobalMarkup(data.useGlobalMarkup !== undefined ? data.useGlobalMarkup : true)
          setGlobalMarkup(data.globalMarkup || 15)
          setCurrentStep(data.currentStep || 0)
        }

        // Load template selection
        const savedTemplateId = localStorage.getItem(STORAGE_KEYS.TEMPLATE_ID)
        if (savedTemplateId) {
          const templateId = JSON.parse(savedTemplateId)
          setSelectedTemplate(templateId)
        }

        // Load variables
        const savedVariables = localStorage.getItem(STORAGE_KEYS.VARIABLES)
        if (savedVariables) {
          setVariableValues(JSON.parse(savedVariables))
        }

        // Load markups
        const savedMarkups = localStorage.getItem(STORAGE_KEYS.MARKUPS)
        if (savedMarkups) {
          setElementMarkups(JSON.parse(savedMarkups))
        }

        // Load labor rates
        const savedRates = localStorage.getItem(STORAGE_KEYS.LABOR_RATES)
        if (savedRates) {
          setLaborRates(JSON.parse(savedRates))
        }
      } catch (error) {
        console.error("Error loading saved data:", error)
        // If error, just continue with default state
      }
    }
  }, [open])

  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplate(templateId)
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setProposalName(`${template.title} Proposal`)
      setProposalDescription(template.description)

      // Initialize element markups and labor rates
      const markups: Record<number, number> = {}
      const rates: Record<number, string> = {}
      
      template.categories.forEach((category) => {
        category.elements.forEach((element) => {
          markups[element.id] = globalMarkup
          rates[element.id] = "0" // Default hourly rate
        })
      })
      
      setElementMarkups(markups)
      setLaborRates(rates)
      
      // Initialize variable values when template is selected
      const initialVariableValues: Record<number, VariableValue> = {}
      template.variables.forEach((variable) => {
        initialVariableValues[variable.id] = {
          id: variable.id,
          name: variable.name,
          type: variable.type,
          value: 0,
          useFormula: false
        }
      })
      
      setVariableValues(initialVariableValues)
    }
  }

  // Navigation between steps
  const goToNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
      
      // If moving to the preview step, calculate cost previews
      if (currentStep === 3) {
        const newPreviews = calculateCostPreviews()
        setCostPreviews(newPreviews)
      }
    } else {
      // Create proposal logic
      handleCreateProposal()
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < STEPS.length) {
      setCurrentStep(stepIndex)
      
      // If moving to the preview step, calculate cost previews
      if (stepIndex === 4) {
        const newPreviews = calculateCostPreviews()
        setCostPreviews(newPreviews)
      }
    }
  }

  const handleCreateProposal = () => {
    // Implement your proposal creation logic here
    onOpenChange(false)
  }

  // All your existing handlers
  const handleVariableValueChange = (variableId: number, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [variableId]: {
        ...prev[variableId],
        value: value
      }
    }))
  }

  const handleInputTypeChange = (variableId: number, useFormula: boolean) => {
    setVariableValues((prev) => ({
      ...prev,
      [variableId]: {
        ...prev[variableId],
        useFormula
      }
    }))
  }

  const handleFormulaChange = (variableId: number, value: string) => {
    // Store formula with proper formatting (will be applied during rendering)
    const cleanedFormula = formatFormula(value)
    
    setVariableValues((prev) => ({
      ...prev,
      [variableId]: {
        ...prev[variableId],
        formula: cleanedFormula
      }
    }))
    
    // Show suggestions if the user is typing a variable name
    const lastWord = value.split(/[\s\+\-\*\/\(\)]/).pop() || ""
    if (lastWord.length > 1) {
      setShowSuggestions((prev) => ({
        ...prev,
        [variableId]: true
      }))
    } else {
      setShowSuggestions((prev) => ({
        ...prev,
        [variableId]: false
      }))
    }
  }
  
  const insertOperator = (variableId: number, operator: string) => {
    if (!variableValues[variableId]) return
    
    const currentFormula = variableValues[variableId].formula || ""
    
    // Add spaces around operators for better readability
    let newFormula
    if (['+', '-', '*', '/'].includes(operator)) {
      // For operators, ensure spaces around them
      if (currentFormula && !currentFormula.endsWith(' ')) {
        newFormula = currentFormula + ' ' + operator + ' '
      } else {
        newFormula = currentFormula + operator + ' '
      }
    } else {
      // For parentheses, don't add spaces
      newFormula = currentFormula + operator
    }
    
    setVariableValues((prev) => ({
      ...prev,
      [variableId]: {
        ...prev[variableId],
        formula: newFormula
      }
    }))
  }
  
  const insertVariable = (variableId: number, variableName: string) => {
    if (!variableValues[variableId]) return
    
    const currentFormula = variableValues[variableId].formula || ""
    const parts = currentFormula.split(/[\s\+\-\*\/\(\)]/)
    const lastPart = parts[parts.length - 1]
    
    let newFormula
    if (lastPart) {
      newFormula = currentFormula.substring(0, currentFormula.lastIndexOf(lastPart)) + `{${variableName}}`
    } else {
      newFormula = currentFormula + `{${variableName}}`
    }
    
    setVariableValues((prev) => ({
      ...prev,
      [variableId]: {
        ...prev[variableId],
        formula: newFormula
      }
    }))
    
    setShowSuggestions((prev) => ({
      ...prev,
      [variableId]: false
    }))
  }
  
  const formatFormula = (formula: string): string => {
    // Replace irregular spacing with consistent spacing around operators
    return formula
      .replace(/\s*\+\s*/g, ' + ')
      .replace(/\s*\-\s*/g, ' - ')
      .replace(/\s*\*\s*/g, ' * ')
      .replace(/\s*\/\s*/g, ' / ')
      .replace(/\(\s*/g, '(')
      .replace(/\s*\)/g, ')')
      .trim()
  }
  
  const getSuggestions = (input: string) => {
    if (!selectedTemplateData || !input) return []
    return selectedTemplateData.variables.filter((variable: any) => 
      variable.name.toLowerCase().includes(input.toLowerCase())
    )
  }
  
  const handleElementMarkupChange = (elementId: number, value: number) => {
    setElementMarkups((prev) => ({
      ...prev,
      [elementId]: value
    }))
  }

  const handleGlobalMarkupChange = (value: number[]) => {
    const newMarkup = value[0]
    setGlobalMarkup(newMarkup)

    // If using global markup, update all element markups
    if (useGlobalMarkup && selectedTemplateData) {
      const markups: Record<number, number> = {}
      selectedTemplateData.categories.forEach((category) => {
        category.elements.forEach((element) => {
          markups[element.id] = newMarkup
        })
      })
      setElementMarkups(markups)
    }
  }
  
  const handleUseGlobalMarkupChange = (checked: boolean) => {
    setUseGlobalMarkup(checked)
    
    // If switching to global markup, update all elements to use the global markup value
    if (checked && selectedTemplateData) {
      const markups: Record<number, number> = {}
      selectedTemplateData.categories.forEach((category) => {
        category.elements.forEach((element) => {
          markups[element.id] = globalMarkup
        })
      })
      setElementMarkups(markups)
    }
  }
  
  const handleLaborRateChange = (elementId: number, value: string) => {
    setLaborRates((prev) => ({
      ...prev,
      [elementId]: value
    }))
  }

  // Safely evaluate formulas to get actual variable values
  const evaluateFormula = (formula: string, variables: Record<number, VariableValue>): number => {
    if (!formula) return 0
    
    try {
      // Replace variable references with actual values
      let evaluatableFormula = formula
      const variablePattern = /{([^}]+)}/g
      let match
      
      while ((match = variablePattern.exec(formula)) !== null) {
        const variableName = match[1]
        
        // Find the variable by name
        const variable = Object.values(variables).find(v => v.name === variableName)
        
        if (variable) {
          let variableValue: number
          if (variable.useFormula && variable.formula) {
            // Recursively evaluate nested formulas
            variableValue = evaluateFormula(variable.formula, variables)
          } else {
            variableValue = typeof variable.value === 'string' ? parseFloat(variable.value) || 0 : variable.value
          }
          
          // Replace the variable reference with its value
          evaluatableFormula = evaluatableFormula.replace(match[0], variableValue.toString())
        } else {
          // If variable not found, replace with 0
          evaluatableFormula = evaluatableFormula.replace(match[0], '0')
        }
      }
      
      // Clean up formula for evaluation
      evaluatableFormula = evaluatableFormula
        .replace(/{/g, '')
        .replace(/}/g, '')
      
      // Use a safer approach to evaluate the formula
      try {
        // First try to use a parser that handles mathematical expressions
        const sanitizedFormula = evaluatableFormula.replace(/[^0-9+\-*/().\s]/g, '');
        return new Function(`return (${sanitizedFormula})`)() || 0;
      } catch (evalError) {
        console.warn("Formula evaluation failed:", evalError);
        return 0;
      }
    } catch (error) {
      // Suppress errors to the console and return 0
      return 0
    }
  }

  // Calculate cost previews for the preview tab
  const calculateCostPreviews = () => {
    if (!selectedTemplateData) return []
    
    const previews: CostPreview[] = []
    
    // First ensure all variable values are calculated
    const calculatedVariables: Record<number, VariableValue> = { ...variableValues }
    
    // Iterate through variables that use formulas to calculate their values
    Object.values(variableValues).forEach(variable => {
      if (variable.useFormula && variable.formula) {
        calculatedVariables[variable.id] = {
          ...variable,
          value: evaluateFormula(variable.formula, calculatedVariables)
        }
      }
    })
    
    // Now calculate costs for each element
    selectedTemplateData.categories.forEach((category: any) => {
      category.elements.forEach((element: any) => {
        const laborRate = parseFloat(laborRates[element.id] || "0")
        const markupPercentage = useGlobalMarkup ? globalMarkup : (elementMarkups[element.id] || globalMarkup)
        
        // Calculate material cost
        let materialCost = 0
        const materialCostRef = element.material_cost
        
        // Find the variable referenced in material_cost
        const materialVariable = selectedTemplateData.variables.find((v: any) => v.name === materialCostRef)
        if (materialVariable && calculatedVariables[materialVariable.id]) {
          materialCost = typeof calculatedVariables[materialVariable.id].value === 'string' ? 
            parseFloat(calculatedVariables[materialVariable.id].value as string) || 0 : 
            calculatedVariables[materialVariable.id].value as number
        }
        
        // Calculate labor cost
        let laborCost = 0
        const laborCostRef = element.labor_cost
        
        // Find the variable referenced in labor_cost
        const laborVariable = selectedTemplateData.variables.find((v: any) => v.name === laborCostRef)
        if (laborVariable && calculatedVariables[laborVariable.id]) {
          laborCost = typeof calculatedVariables[laborVariable.id].value === 'string' ? 
            parseFloat(calculatedVariables[laborVariable.id].value as string) || 0 : 
            calculatedVariables[laborVariable.id].value as number
            
          // Multiply by labor rate
          laborCost = laborCost * laborRate
        }
        
        // Calculate markup amount
        const baseTotal = materialCost + laborCost
        const markupAmount = (baseTotal * markupPercentage) / 100
        const totalCost = baseTotal + markupAmount
        
        previews.push({
          elementId: element.id,
          elementName: element.name,
          categoryName: category.name,
          materialCost,
          laborCost,
          laborRate,
          markupPercentage,
          markupAmount,
          totalCost
        })
      })
    })
    
    return previews
  }

  // Update cost previews when variables, markups, or labor rates change
  useEffect(() => {
    if (currentStep === 4 && selectedTemplateData) {
      const newPreviews = calculateCostPreviews()
      setCostPreviews(newPreviews)
    }
  }, [currentStep, variableValues, elementMarkups, laborRates, globalMarkup, useGlobalMarkup])

  // Computed total costs for the preview summary
  const totalCosts = useMemo(() => {
    return costPreviews.reduce((acc, preview) => {
      return {
        materialCost: acc.materialCost + preview.materialCost,
        laborCost: acc.laborCost + preview.laborCost,
        markupAmount: acc.markupAmount + preview.markupAmount,
        totalCost: acc.totalCost + preview.totalCost
      }
    }, { materialCost: 0, laborCost: 0, markupAmount: 0, totalCost: 0 })
  }, [costPreviews])

  // Get the step description
  const getStepDescription = (step: number) => {
    switch (step) {
      case 0: return "Enter basic information about your proposal and client";
      case 1: return "Set values for variables used in calculations";
      case 2: return "Select which categories to include in your proposal";
      case 3: return "Configure markup and labor rates for elements";
      case 4: return "Review costs and finalize your proposal";
      default: return "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-background p-0 rounded-lg">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl">Create Construction Proposal</DialogTitle>
          <DialogDescription className="text-base mb-4">
            {getStepDescription(currentStep)}
          </DialogDescription>
          
          {/* Step Indicator */}
          <StepIndicator 
            steps={STEPS.map(s => s.label)} 
            currentStep={currentStep}
            onStepClick={goToStep}
          />
        </DialogHeader>

        <div className="px-6 py-4">
          {/* Step 0: Proposal Details and Markup */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <ProposalDetails 
                useTemplate={useTemplate}
                selectedTemplate={selectedTemplate}
                templates={templates}
                proposalName={proposalName}
                proposalDescription={proposalDescription}
                clientName={clientName}
                clientEmail={clientEmail}
                clientPhone={clientPhone}
                onUseTemplateChange={setUseTemplate}
                onTemplateSelect={handleTemplateSelect}
                onProposalNameChange={setProposalName}
                onProposalDescriptionChange={setProposalDescription}
                onClientNameChange={setClientName}
                onClientEmailChange={setClientEmail}
                onClientPhoneChange={setClientPhone}
              />

              {/* Only show markup settings if a template is selected */}
              {selectedTemplateData && (
                <MarkupSettings 
                  selectedTemplateData={selectedTemplateData}
                  useGlobalMarkup={useGlobalMarkup}
                  globalMarkup={globalMarkup}
                  onUseGlobalMarkupChange={handleUseGlobalMarkupChange}
                  onGlobalMarkupChange={handleGlobalMarkupChange}
                />
              )}
            </div>
          )}

          {/* Step 1: Variables */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <VariablesTab 
                selectedTemplateData={selectedTemplateData}
                variableValues={variableValues}
                showSuggestions={showSuggestions}
                onVariableValueChange={handleVariableValueChange}
                onInputTypeChange={handleInputTypeChange}
                onFormulaChange={handleFormulaChange}
                insertOperator={insertOperator}
                insertVariable={insertVariable}
                getSuggestions={getSuggestions}
                evaluateFormula={evaluateFormula}
              />
            </div>
          )}

          {/* Step 2: Categories */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <CategoriesTab 
                selectedTemplateData={selectedTemplateData}
                editingEnabled={editingEnabled}
                onEditingEnabledChange={setEditingEnabled}
              />
            </div>
          )}

          {/* Step 3: Elements */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <ElementsTab 
                selectedTemplateData={selectedTemplateData}
                useGlobalMarkup={useGlobalMarkup}
                globalMarkup={globalMarkup}
                elementMarkups={elementMarkups}
                laborRates={laborRates}
                onElementMarkupChange={handleElementMarkupChange}
                onLaborRateChange={handleLaborRateChange}
              />
            </div>
          )}

          {/* Step 4: Preview Cost */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <PreviewTab 
                selectedTemplateData={selectedTemplateData}
                costPreviews={costPreviews}
                useGlobalMarkup={useGlobalMarkup}
                globalMarkup={globalMarkup}
                totalCosts={totalCosts}
              />
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="sticky bottom-0 left-0 right-0 bg-background flex justify-between items-center px-6 py-4 border-t z-10">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
            className="rounded-md"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-md"
            >
              Cancel
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={goToNextStep}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-6"
                  >
                    {currentStep === STEPS.length - 1 ? "Create Proposal" : "Next"}
                    {currentStep < STEPS.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="rounded-md">
                  {currentStep === STEPS.length - 1 
                    ? "Create your proposal" 
                    : `Continue to ${STEPS[currentStep + 1].label}`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}