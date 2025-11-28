import React from 'react';

export enum AppState {
  INPUT = 'INPUT',
  PROCESSING = 'PROCESSING',
  REPORT = 'REPORT',
}

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface ProductContext {
  targetAudience: string;
  currentState: string;
  primaryGoal: string;
  productType: string;
  images: string[]; // Base64 strings array
}

export interface DiagnosisPoint {
  title: string;
  description: string;
}

export type LoadingMessage = string;

// Reusable UI Props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}