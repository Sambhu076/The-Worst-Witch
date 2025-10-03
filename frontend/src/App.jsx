
import { React, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Witch1 from './witch1'
function App() {


  return (
    <Routes>
      <Route path="/witch" element={<Witch1 />} />
    </Routes>
  )
}

export default App