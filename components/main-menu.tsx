"use client"

import { useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"

interface MainMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MainMenu({ isOpen, onClose }: MainMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="z-10" onClick={onClose}>
          <div className="text-2xl font-light tracking-wider">
            <span className="font-extralight"></span>
            <span className="font-medium text-blue-400"></span>
          </div>
        </Link>

        <button className="focus:outline-none" aria-label="Close Menu" onClick={onClose}>
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <nav className="space-y-8 text-center">
          <Link
            href="#solutions"
            className="block text-3xl md:text-4xl font-extralight tracking-wide hover:text-blue-400 transition-colors"
            onClick={onClose}
          >
            Solutions
          </Link>
          <Link
            href="#features"
            className="block text-3xl md:text-4xl font-extralight tracking-wide hover:text-blue-400 transition-colors"
            onClick={onClose}
          >
            Features
          </Link>
          <Link
            href="#modules"
            className="block text-3xl md:text-4xl font-extralight tracking-wide hover:text-blue-400 transition-colors"
            onClick={onClose}
          >
            Modules
          </Link>
          <Link
            href="#integrations"
            className="block text-3xl md:text-4xl font-extralight tracking-wide hover:text-blue-400 transition-colors"
            onClick={onClose}
          >
            Integrations
          </Link>
          <Link
            href="#contact"
            className="block text-3xl md:text-4xl font-extralight tracking-wide hover:text-blue-400 transition-colors"
            onClick={onClose}
          >
            Contact
          </Link>
        </nav>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div className="mb-4 md:mb-0">
            <p>info@fieldx.com</p>
            <p>+30 210 1234567</p>
          </div>
          <div>
            <p>Athens, Greece</p>
          </div>
        </div>
      </div>
    </div>
  )
}

