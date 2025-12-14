'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const roleFromUrl = searchParams.get('role');
  
  useState(() => {
    if (roleFromUrl === 'provider') {
      setFormData(prev => ({ ...prev, role: 'provider' }));
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      setTimeout(() => {
        alert('Signup functionality would be implemented here. For demo purposes, please use the existing accounts.');
        router.push('/auth/login');
      }, 1000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-gradient font-modern tracking-tight mb-2">
              Herafi
            </h1>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
          <p className="text-gray-600">Join thousands of satisfied users</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={formData.role === 'customer'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-full text-center ${formData.role === 'customer' ? 'text-[#8F210E] border-[#8F210E] bg-red-50' : 'text-gray-600 border-gray-300'} border-2 rounded-lg p-2`}>
                    <div className="font-semibold">Find Services</div>
                    <div className="text-xs">I'm a customer</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="provider"
                    checked={formData.role === 'provider'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-full text-center ${formData.role === 'provider' ? 'text-[#8F210E] border-[#8F210E] bg-red-50' : 'text-gray-600 border-gray-300'} border-2 rounded-lg p-2`}>
                    <div className="font-semibold">Offer Services</div>
                    <div className="text-xs">I'm a provider</div>
                  </div>
                </label>
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />

            <Input
              label="Email address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              required
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[#8F210E] hover:text-[#7A1010] font-semibold">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 text-xs text-gray-500 text-center">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="underline">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}