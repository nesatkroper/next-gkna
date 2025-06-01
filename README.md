# Fertizer MS 🌱

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.15.0-blue)](https://www.prisma.io/)

**Fertizer MS** is a modern, full-stack application built with Next.js for managing fertilizer categories and products. Designed for agricultural businesses and inventory managers, it offers a scalable API for CRUD operations, soft deletion, and product associations, powered by Prisma and TypeScript.

## Features

- **Category Management**: Create, read, update, and soft-delete fertilizer categories with details like name, code, picture, and memo.
- **Product Integration**: Link categories to products, with safeguards to prevent deletion of categories with active products.
- **RESTful API**: Robust endpoints for seamless category management using Next.js API routes.
- **Soft Deletion**: Safely mark categories as deleted without data loss.
- **Type-Safe Database**: Prisma ORM ensures efficient and reliable database interactions.
- **Error Handling**: Comprehensive error responses for better debugging and user feedback.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 14.2.5
- **ORM**: [Prisma](https://www.prisma.io/) 5.15.0
- **Database**: PostgreSQL (or any Prisma-supported database)
- **Language**: TypeScript
- **Runtime**: Node.js 16+
- **Tools**: ESLint, Prettier, Vercel (for deployment)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) database
- Git

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/<your-username>/fertizer-ms.git
   cd fertizer-ms