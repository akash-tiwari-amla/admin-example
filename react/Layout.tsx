// react/components/Layout.tsx
import React, { useState } from 'react'
import { PageBlock, Tabs, Tab } from 'vtex.styleguide'

import Dashboard from './components/Dashboard'
import SettingForm from './components/SettingForm'

const Layout = () => {
  const [currentTab, setCurrentTab] = useState(0)

  return (
    <PageBlock variation="full">
      <Tabs>
        <Tab
          label="Dashboard"
          active={currentTab === 0}
          onClick={() => setCurrentTab(0)}
        />
        <Tab
          label="Settings"
          active={currentTab === 1}
          onClick={() => setCurrentTab(1)}
        />
      </Tabs>

      <div className="mt6">
        {currentTab === 0 && <Dashboard />}
        {currentTab === 1 && <SettingForm />}
      </div>
    </PageBlock>
  )
}

export default Layout
