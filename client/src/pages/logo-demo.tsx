import React from 'react';
import { LogoOption1, LogoOption2, LogoOption3, LogoOption4, LogoOption5, LogoOption6, LogoOption7, LogoOption8, LogoOption9 } from '../components/ui/logo-variations';
import { Logo } from '../components/ui/logo';

export default function LogoDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Contract Clarity Logo Options
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose your preferred logo style for the Contract Clarity brand
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Current Logo */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Current Logo</h3>
              <p className="text-sm text-gray-500">Simple & Clean</p>
            </div>
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <Logo size="md" />
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <Logo size="sm" />
              </div>
            </div>
          </div>

          {/* Option 1: Modern Minimalist */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Option 1</h3>
              <p className="text-sm text-gray-500">Modern Minimalist</p>
            </div>
            <div className="flex justify-center mb-6">
              <LogoOption1 size="lg" />
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <LogoOption1 size="md" />
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <LogoOption1 size="sm" />
              </div>
            </div>
          </div>

          {/* Option 2: Elegant Luxury */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Option 2</h3>
              <p className="text-sm text-gray-500">Elegant Luxury</p>
            </div>
            <div className="flex justify-center mb-6">
              <LogoOption2 size="lg" />
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <LogoOption2 size="md" />
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <LogoOption2 size="sm" />
              </div>
            </div>
          </div>

          {/* Option 3: Corporate Professional */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Option 3</h3>
              <p className="text-sm text-gray-500">Corporate Professional</p>
            </div>
            <div className="flex justify-center mb-6">
              <LogoOption3 size="lg" />
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <LogoOption3 size="md" />
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <LogoOption3 size="sm" />
              </div>
            </div>
          </div>

          {/* Option 4: Luxury Diamond */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Option 4</h3>
              <p className="text-sm text-gray-500">Luxury Diamond</p>
            </div>
            <div className="flex justify-center mb-6">
              <LogoOption4 size="lg" />
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <LogoOption4 size="md" />
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <LogoOption4 size="sm" />
              </div>
            </div>
          </div>

          {/* Option 5: Tech Startup */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Option 5</h3>
              <p className="text-sm text-gray-500">Tech Startup</p>
            </div>
            <div className="flex justify-center mb-6">
              <LogoOption5 size="lg" />
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <LogoOption5 size="md" />
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <LogoOption5 size="sm" />
              </div>
            </div>
          </div>

          {/* Option 6: Monogram Style */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Option 6</h3>
              <p className="text-sm text-gray-500">Monogram Badge</p>
            </div>
            <div className="flex justify-center mb-6">
              <LogoOption6 size="lg" />
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <LogoOption6 size="md" />
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <LogoOption6 size="sm" />
              </div>
            </div>
          </div>

          {/* Option 7: Shield Security */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Option 7</h3>
              <p className="text-sm text-gray-500">Shield Security</p>
            </div>
            <div className="flex justify-center mb-6">
              <LogoOption7 size="lg" />
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <LogoOption7 size="md" />
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <LogoOption7 size="sm" />
              </div>
            </div>
          </div>

          {/* Option 8: Geometric Abstract */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Option 8</h3>
              <p className="text-sm text-gray-500">Geometric Abstract</p>
            </div>
            <div className="flex justify-center mb-6">
              <LogoOption8 size="lg" />
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <LogoOption8 size="md" />
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <LogoOption8 size="sm" />
              </div>
            </div>
          </div>

          {/* Option 9: Vintage Badge */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Option 9</h3>
              <p className="text-sm text-gray-500">Vintage Badge</p>
            </div>
            <div className="flex justify-center mb-6">
              <LogoOption9 size="lg" />
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <LogoOption9 size="md" />
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <LogoOption9 size="sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
            Logo Characteristics Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-white">Style</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-white">Personality</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-white">Best For</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-white">Colors</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">Current</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Simple, Professional</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Clean, minimal branding</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Blue to Purple gradient</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">Option 1</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Modern, Sleek, Approachable</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Tech-forward companies</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Purple to Indigo circular</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">Option 2</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Sophisticated, Premium, Trustworthy</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">High-end legal services</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Deep purple hexagon</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">Option 3</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Corporate, Reliable, Established</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Enterprise clients</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Professional square design</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">Option 4</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Luxury, Exclusive, Premium</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">High-value legal services</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Diamond luxury styling</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">Option 5</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Innovative, Tech-savvy, Dynamic</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">AI/Tech focused branding</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Modern tech gradients</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">Option 6</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Classic, Timeless, Elegant</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Traditional legal firms</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">CC monogram in circular badge</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">Option 7</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Secure, Protective, Trustworthy</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Security-focused services</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Shield with document protection</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">Option 8</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Modern, Artistic, Unique</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Creative agencies</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Abstract geometric pentagon</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">Option 9</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Established, Classic, Premium</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Heritage law firms</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Vintage badge with stars</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Visit <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">/logo-demo</span> to see all options
          </p>
        </div>
      </div>
    </div>
  );
}