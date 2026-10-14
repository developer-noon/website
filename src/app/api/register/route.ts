import { NextResponse } from 'next/server';
import { createUser } from '@/lib/users';

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const { name, email, password, confirmPassword, phone, company } = body;

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || typeof confirmPassword !== 'string') {
      return NextResponse.json({ error: 'Name, email, password, and password confirmation are required.' }, { status: 400 });
    }

    if (!name.trim() || !email.trim()) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    if (name.trim().length > 100 || email.trim().length > 254) {
      return NextResponse.json({ error: 'Name or email is too long.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    if (password.length > 128) {
      return NextResponse.json({ error: 'Password must be 128 characters or fewer.' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    const user = await createUser({
      name,
      email,
      password,
      phone: typeof phone === 'string' ? phone.slice(0, 40) : '',
      company: typeof company === 'string' ? company.slice(0, 120) : '',
    });

    return NextResponse.json(
      {
        message: 'User registered successfully.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          phone: user.phone,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
