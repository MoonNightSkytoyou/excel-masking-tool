/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ErrorBoundary from './components/ErrorBoundary';
import ExcelMasker from './components/ExcelMasker';

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50/50 text-gray-800 antialiased selection:bg-indigo-100 selection:text-indigo-900" id="em-app-root">
        <main className="py-6" id="em-main">
          <ExcelMasker />
        </main>
      </div>
    </ErrorBoundary>
  );
}
