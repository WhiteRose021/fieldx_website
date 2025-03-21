import Link from "next/link"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-blue-400">Field</span>
              <span className="text-2xl font-bold text-white">X</span>
            </div>
            <p className="mb-4">
              The complete CRM/FSM platform for managing FTTH projects in Greece, connecting field and office engineers
              in real-time.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Solutions
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Webinars
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-blue-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} FieldX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

