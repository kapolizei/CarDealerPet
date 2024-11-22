'use client'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'

const fetchVehicleModels = async (makeId, year) => {
  const response = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeIdYear/makeId/${makeId}/modelyear/${year}?format=json`
  )
  const data = await response.json()
  return data.Results || []
}

// Suspense Component
const VehicleModels = ({ makeId, year }) => {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadModels = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedModels = await fetchVehicleModels(makeId, year)
        setModels(fetchedModels)
      } catch (error) {
        setError('Err.')
      } finally {
        setLoading(false)
      }
    }
    if (makeId && year) {
      loadModels()
    }
  }, [makeId, year])

  if (loading) {
    return <p className="text-blue-500 text-center">Loading...</p>
  }
  if (error) {
    return <p className="text-red-500 text-center">{error}</p>
  }

  return (
    <div className="mt-4">
      <h2 className="font-semibold text-lg">Available models:</h2>
      {models.length > 0 ? (
        <div className="bg-gray-100 rounded-2xl p-4 shadow-md mt-2">
          <ul className="list-disc pl-5">
            {models.map((model) => (
              <li key={model.Model_ID} className="text-sm text-gray-700">
                {model.Model_Name}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500">No models found.</p>
      )}
    </div>
  )
}

export default function Home() {
  const [makes, setMakes] = useState([])
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedMakeId, setSelectedMakeId] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const currentYear = new Date().getFullYear()

  const fetchVehicleMakes = async () => {
    try {
      const response = await fetch(
        'https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json'
      )
      const data = await response.json()
      if (Array.isArray(data.Results)) {
        setMakes(data.Results)
      } else {
        console.error('Results is not an array:', data.Results)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  useEffect(() => {
    fetchVehicleMakes()
  }, [])

  const generateYears = () => {
    const years = []
    // Start from 2013
    for (let year = 2013; year <= currentYear; year++) {
      years.push(year)
    }
    return years
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-300 p-6">
      <h1 className="text-3xl font-bold text-center text-indigo-900 mb-6">
        Car Dealer App
      </h1>

      <div className="w-full max-w-xs mb-4">
        <label
          htmlFor="vehicle-make"
          className="block text-gray-800 text-sm font-medium"
        >
          Car Brand:
        </label>
        <select
          id="vehicle-make"
          value={selectedMake}
          onChange={(e) => {
            const makeName = e.target.value
            setSelectedMake(makeName)
            const make = makes.find((make) => make.MakeName === makeName)
            setSelectedMakeId(make?.MakeId || '') // Save selected make ID
          }}
          className="w-full border p-3 rounded-lg bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Car Brand</option>
          {makes.map((make) => (
            <option key={make.MakeId} value={make.MakeName}>
              {make.MakeName}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full max-w-xs mb-6">
        <label
          htmlFor="model-year"
          className="block text-gray-800 text-sm font-medium"
        >
          Year of Manufacture:
        </label>
        <select
          id="model-year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full border p-3 rounded-lg bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Year</option>
          {generateYears().map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 text-center">
        <h2 className="font-medium text-lg text-gray-700">Your Selection:</h2>
        <p className="text-gray-600">
          Brand: <span className="font-semibold">{selectedMake || 'None'}</span>
        </p>
        <p className="text-gray-600">
          Year: <span className="font-semibold">{selectedYear || 'None'}</span>
        </p>
      </div>

      {/* When all selected => */}
      {selectedMakeId && selectedYear && (
        <Suspense
          fallback={
            <p className="text-blue-500 text-center">Loading models...</p>
          }
        >
          <VehicleModels makeId={selectedMakeId} year={selectedYear} />
        </Suspense>
      )}

      <div className="mt-4">
        <Link
          href={`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeIdYear/makeId/${selectedMakeId}/modelyear/${selectedYear}?format=json`}
        >
          <button
            disabled={!selectedMakeId || !selectedYear}
            className="bg-indigo-600 text-white p-3 rounded-lg w-full max-w-xs disabled:bg-gray-400 transition-colors"
          >
            Show Models
          </button>
        </Link>
      </div>
    </div>
  )
}
