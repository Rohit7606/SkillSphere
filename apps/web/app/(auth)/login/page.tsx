import React from 'react';
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="flex justify-center w-full">
      <SignIn routing="hash" />
    </div>
  );
}
