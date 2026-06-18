import React from 'react';
import { SignUp } from '@clerk/nextjs';

export default function RegisterPage() {
  return (
    <div className="flex justify-center w-full">
      <SignUp routing="hash" />
    </div>
  );
}
