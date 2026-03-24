// react/components/SettingForm.tsx
import React, { useState, useEffect } from 'react'
import { Input, Button, PageBlock, Spinner, Alert } from 'vtex.styleguide'

const SAVE_API_URL = 'https://integrationdevapi.artifi.net/api/3/Vtex/SaveConfigurationDetails'
const GET_API_URL = 'https://integrationdevapi.artifi.net/api/3/Vtex/GetVtexConfigurationDetails'
// Dynamically extract the account ID from the hostname (e.g., "devakash--sandboxhimanshu11" from "devakash--sandboxhimanshu11.myvtex.com")
const getAccountId = () => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  if (hostname.includes('.myvtex.com')) {
    return hostname.split('.myvtex.com')[0]
  }
  return 'sandboxhimanshu11' // Fallback
}
const ACCOUNT_ID = getAccountId()

interface FormState {
  WebsiteId: string
  WebApiClientKey: string
  IntegrationType: string
  IntegrationURL: string
  DomainUrl: string
}

const initialForm: FormState = {
  WebsiteId: '',
  WebApiClientKey: '',
  IntegrationType: '',
  IntegrationURL: '',
  DomainUrl: '',
}

const SettingForm = () => {
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch current configuration on mount to pre-populate the form
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${GET_API_URL}?storeHash=${ACCOUNT_ID}`, {
          headers: {
            accept: 'text/plain; x-api-version=3.0',
          },
        })
        if (!response.ok) throw new Error('Failed to fetch configuration')
        const data = await response.json()
        console.log('Fetched config:', data)
        const config = data.Data ?? {}
        setForm({
          WebsiteId: config.WebsiteId != null ? String(config.WebsiteId) : '',
          WebApiClientKey: config.WebApiClientKey ?? '',
          IntegrationType: config.IntegrationType ?? '',
          IntegrationURL: config.IntegrationURL ?? '',
          DomainUrl: config.DomainUrl ?? '',
        })
      } catch (err) {
        console.error('Error fetching Artifi configuration:', err)
      } finally {
        setFetchLoading(false)
      }
    }

    fetchConfig()
  }, [])

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setForm((prev) => ({ ...prev, [field]: value }))
    setSuccessMessage(null)
    setErrorMessage(null)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    const payload = {
      WebsiteId: Number(form.WebsiteId),
      WebApiClientKey: form.WebApiClientKey,
      IntegrationType: form.IntegrationType,
      IntegrationURL: form.IntegrationURL,
      DomainUrl: form.DomainUrl,
    }

    try {
      const response = await fetch(`${SAVE_API_URL}/${ACCOUNT_ID}`, {
        method: 'POST',
        headers: {
          accept: 'text/plain; x-api-version=3.0',
          'Content-Type': 'application/json; x-api-version=3.0',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `Request failed with status ${response.status}`)
      }

      setSuccessMessage('Configuration saved successfully!')
    } catch (err) {
      const error = err as any
      setErrorMessage(error?.message ?? 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <PageBlock variation="full" title="Artifi Configuration Settings">
        <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
          <Spinner />
        </div>
      </PageBlock>
    )
  }

  return (
    <PageBlock variation="full" title="Artifi Configuration Settings">
      <div className="flex flex-column gap4" style={{ maxWidth: 600 }}>
        {successMessage && (
          <div className="mb4">
            <Alert type="success" onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          </div>
        )}

        {errorMessage && (
          <div className="mb4">
            <Alert type="error" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          </div>
        )}

        <div className="mb5">
          <Input
            label="Website ID"
            type="number"
            placeholder="e.g. 12"
            value={form.WebsiteId}
            onChange={handleChange('WebsiteId')}
          />
        </div>

        <div className="mb5">
          <Input
            label="Web API Client Key"
            placeholder="Enter your API client key"
            value={form.WebApiClientKey}
            onChange={handleChange('WebApiClientKey')}
          />
        </div>

        <div className="mb5">
          <Input
            label="Integration Type"
            placeholder="Enter integration type"
            value={form.IntegrationType}
            onChange={handleChange('IntegrationType')}
          />
        </div>

        <div className="mb5">
          <Input
            label="Integration URL"
            placeholder="https://..."
            value={form.IntegrationURL}
            onChange={handleChange('IntegrationURL')}
          />
        </div>

        <div className="mb5">
          <Input
            label="Domain URL"
            placeholder="https://yourdomain.com"
            value={form.DomainUrl}
            onChange={handleChange('DomainUrl')}
          />
        </div>

        <div className="mt4">
          {loading ? (
            <Spinner />
          ) : (
            <Button variation="primary" onClick={handleSubmit}>
              Save Configuration
            </Button>
          )}
        </div>
      </div>
    </PageBlock>
  )
}

export default SettingForm
