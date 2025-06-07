// pages/products/index.tsx
import { usePermissions } from '@/hooks/usePermissions';

export default function ProductsPage() {
  const { canCreate, canUpdate, canDelete } = usePermissions();

  return (
    <div>
      {/* Product list table */}
      {canCreate && (
        <Button onClick={() => router.push('/products/create')}>
          Create Product
        </Button>
      )}

      {/* In your table actions column */}
      <TableCell>
        {canUpdate && (
          <Button variant="ghost" onClick={() => handleEdit(product.id)}>
            <EditIcon />
          </Button>
        )}
        {canDelete && (
          <Button variant="ghost" onClick={() => handleDelete(product.id)}>
            <DeleteIcon />
          </Button>
        )}
      </TableCell>
    </div>
  );
}


// pages/api/products/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  
  if (req.method === 'PUT' || req.method === 'PATCH') {
    if (!session?.user?.permissions?.canUpdate) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  if (req.method === 'DELETE') {
    if (!session?.user?.permissions?.canDelete) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  // Handle the request...
}