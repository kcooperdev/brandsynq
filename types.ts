
import React from 'react';

export interface Initiative {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
  link: string;
}

export interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
}