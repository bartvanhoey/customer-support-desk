'use client';

import { useState } from "react";

interface SupportResponse{
  success: boolean;
  customerId: string;
  response: string;
  timestamp: number;
}

export default function Home() {

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SupportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Reset error and result states
    setLoading(true);
    setError(null);
    setResult(null);

    try {

      console.log("Submitting support request for customer:", customerId);
      console.log("Description:", description);

      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId, description }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
      }

      const data = (await response.json()) as SupportResponse;
      console.log("Support response received:", data);
      setResult(data);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <main className="w-full max-w-2xl">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-4">🎧 Customer Support Desk</h1>
          <p className="text-gray-700 dark:text-gray-300">
            How can we assist you today? Please select an option below to get
            started.
          </p>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-300 dark:border-green-700 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-green-900 dark:text-green-100 mb-4">
                ✅ Support Response Received
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                    Customer ID
                  </p>
                  <p className="text-green-700 dark:text-green-300">
                    {result.customerId}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                    AI Response
                  </p>
                  <div className="bg-white dark:bg-zinc-800 rounded p-4 mt-2 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap text-sm max-h-64 overflow-y-auto">
                    {result.response}
                  </div>
                </div>
                <div>
                  <p
                    className="text-xs text-green-600 dark:text-green-400"
                    suppressHydrationWarning
                  >
                    Processed: {new Date(result.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-6" onSubmit={handleSubmit}>
            {/* Form fields for customer support request go here */}
            <div className="mt-4">
              <label htmlFor="customerId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Customer ID
              </label>
              <input
                type="text"
                id="customerId"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Enter your customer ID"
                name="customerId"
                className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="mt-4">
              <label htmlFor="issueDescription" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Issue Description
              </label>
              <textarea
                id="issueDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                name="issueDescription"
                placeholder="Describe your issue... (e.g., I was charged twice, my service keeps timing out, etc.)"
                rows={4}
                className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="mt-4">
              <button
              type="submit"
              disabled={loading || !customerId || !description}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {loading ? '🔄 Processing...' : '📨 Submit Support Request'}
            </button>
            </div>
          </form>

              <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold text-black dark:text-white mb-4">Example Issues:</h3>
            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <p>• &quot;I was charged twice for my subscription this month. Can I get a refund?&quot;</p>
              <p>• &quot;My API service keeps timing out. I&apos;m getting connection refused errors every 5 minutes.&quot;</p>
              <p>• &quot;I need to update my email address and upgrade my account tier.&quot;</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
