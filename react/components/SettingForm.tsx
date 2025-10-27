import React, { useState } from 'react'
import { Input, Button, PageBlock } from 'vtex.styleguide'
// import axios from 'axios'

const SettingForm = () => {
  const [formData, setFormData] = useState({
    integrationUrl: '',
    websiteId: '',
    webAPIClientKey: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // const res = await axios.post('/_v/artifi/setting', formData)
      window.alert('Settings saved successfully!')
    } catch (err) {
      console.error('Error saving settings:', err)
      window.alert('Failed to save settings.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageBlock variation="full">
      <form onSubmit={handleSubmit}>
        <div className="mb5">
          <Input
            label="Integration URL"
            name="integrationUrl"
            value={formData.integrationUrl}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb5">
          <Input
            label="Website ID"
            name="websiteId"
            value={formData.websiteId}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb5">
          <Input
            label="Web API Client Key"
            name="webAPIClientKey"
            value={formData.webAPIClientKey}
            onChange={handleChange}
            required
          />
        </div>
        <Button type="submit" isLoading={isSubmitting}>
          Submit
        </Button>
      </form>
    </PageBlock>
  )
}

export default SettingForm
