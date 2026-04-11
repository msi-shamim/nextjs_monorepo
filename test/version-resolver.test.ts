import { describe, it, expect } from 'vitest';
import { VersionResolver } from '../src/version-resolver.js';

describe('VersionResolver', () => {
  it('returns fallback for known packages', () => {
    const resolver = new VersionResolver();
    const fallback = resolver.getFallback('next');
    expect(fallback).toMatch(/^\^/);
    expect(fallback).not.toBe('latest');
  });

  it('returns "latest" for unknown packages', () => {
    const resolver = new VersionResolver();
    expect(resolver.getFallback('some-unknown-package-xyz')).toBe('latest');
  });

  it('all fallbacks use caret syntax', () => {
    const fallbacks = VersionResolver.getFallbacks();
    for (const [pkg, version] of Object.entries(fallbacks)) {
      expect(version, `${pkg} should use caret syntax`).toMatch(/^\^/);
    }
  });

  it('has fallbacks for core packages', () => {
    const fallbacks = VersionResolver.getFallbacks();
    expect(fallbacks).toHaveProperty('next');
    expect(fallbacks).toHaveProperty('react');
    expect(fallbacks).toHaveProperty('react-dom');
    expect(fallbacks).toHaveProperty('typescript');
    expect(fallbacks).toHaveProperty('turbo');
  });

  it('has fallbacks for NestJS packages', () => {
    const fallbacks = VersionResolver.getFallbacks();
    expect(fallbacks).toHaveProperty('@nestjs/core');
    expect(fallbacks).toHaveProperty('@nestjs/common');
    expect(fallbacks).toHaveProperty('@nestjs/platform-express');
  });

  it('has fallbacks for Express packages', () => {
    const fallbacks = VersionResolver.getFallbacks();
    expect(fallbacks).toHaveProperty('express');
    expect(fallbacks).toHaveProperty('@types/express');
  });

  it('has fallbacks for all state management packages', () => {
    const fallbacks = VersionResolver.getFallbacks();
    expect(fallbacks).toHaveProperty('zustand');
    expect(fallbacks).toHaveProperty('jotai');
    expect(fallbacks).toHaveProperty('@reduxjs/toolkit');
    expect(fallbacks).toHaveProperty('@tanstack/react-query');
  });

  it('has fallbacks for ORM packages', () => {
    const fallbacks = VersionResolver.getFallbacks();
    expect(fallbacks).toHaveProperty('prisma');
    expect(fallbacks).toHaveProperty('@prisma/client');
    expect(fallbacks).toHaveProperty('drizzle-orm');
    expect(fallbacks).toHaveProperty('drizzle-kit');
  });

  it('has fallbacks for auth packages', () => {
    const fallbacks = VersionResolver.getFallbacks();
    expect(fallbacks).toHaveProperty('next-auth');
    expect(fallbacks).toHaveProperty('jsonwebtoken');
    expect(fallbacks).toHaveProperty('bcryptjs');
  });

  it('has fallbacks for styling packages', () => {
    const fallbacks = VersionResolver.getFallbacks();
    expect(fallbacks).toHaveProperty('tailwindcss');
    expect(fallbacks).toHaveProperty('styled-components');
  });

  it('resolve returns versions for given packages', async () => {
    const resolver = new VersionResolver();
    // Use a very short timeout to force fallbacks (no actual network)
    const versions = await resolver.resolve(['next', 'react']);
    expect(versions).toHaveProperty('next');
    expect(versions).toHaveProperty('react');
    expect(versions['next']).toMatch(/^\^/);
    expect(versions['react']).toMatch(/^\^/);
  });

  it('getVersions returns resolved map', async () => {
    const resolver = new VersionResolver();
    await resolver.resolve(['typescript']);
    const versions = resolver.getVersions();
    expect(versions).toHaveProperty('typescript');
  });
});
