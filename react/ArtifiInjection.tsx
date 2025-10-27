import React from 'react'

const ArtifiInjection = () => {
  return (
    <div>
      <div
        id="artifi-upload-user-image"
        data-selector="artifi-upload-user-image"
        data-image-id="image_1"
        className="mt-2 mb-2"
      />
      <div>
        <div id="artifi-text-area" data-text-id="text_1" />
      </div>

      <div className="flex gap-2 mt-2">
        <div id="artifi-text-bold" data-text-id="text_1" />
        <div id="artifi-text-italic" data-text-id="text_1" />
        <div id="artifi-horizontal-alignment" data-text-id="text_1" />
      </div>

      <div>
        <div id="artifi-text-color" data-text-id="text_1" data-page-size="50" />
      </div>
    </div>
  )
}

export default ArtifiInjection
