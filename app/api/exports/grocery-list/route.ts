import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies } from '@/lib/supabase/server';
import { requirePremiumFeature } from '@/lib/api-guards';

// POST - Export grocery list (Premium)
export async function POST(request: NextRequest) {
  try {
    // Check premium access for exports
    const guardResult = await requirePremiumFeature(request, "exports");
    if (!guardResult.success) {
      return guardResult.response;
    }

    const response = NextResponse.next();
    const supabase = createServerClientWithCookies(request, response);
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    const { listId, format = 'json' } = body;
    
    if (!listId) {
      return NextResponse.json(
        { error: 'Grocery list ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership of the grocery list
    const { data: list, error: listError } = await supabase
      .from('grocery_lists')
      .select(`
        *,
        grocery_list_items (
          id,
          name,
          quantity,
          unit,
          category,
          is_checked,
          created_at
        )
      `)
      .eq('id', listId)
      .eq('user_id', userId)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: 'Grocery list not found or access denied' },
        { status: 404 }
      );
    }

    // Generate export data
    const exportData = {
      list: {
        id: list.id,
        name: list.name,
        created_at: list.created_at,
        updated_at: list.updated_at
      },
      items: list.grocery_list_items || [],
      exported_at: new Date().toISOString(),
      total_items: list.grocery_list_items?.length || 0,
      checked_items: list.grocery_list_items?.filter((item: any) => item.is_checked).length || 0
    };

    // Return data in requested format
    if (format === 'csv') {
      const csvHeaders = 'Name,Quantity,Unit,Category,Checked\n';
      const csvRows = (list.grocery_list_items || []).map((item: any) => 
        `"${item.name}","${item.quantity || ''}","${item.unit || ''}","${item.category || ''}","${item.is_checked ? 'Yes' : 'No'}"`
      ).join('\n');
      
      const csvContent = csvHeaders + csvRows;
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="grocery-list-${list.name.replace(/[^a-zA-Z0-9]/g, '-')}.csv"`
        }
      });
    } else if (format === 'txt') {
      const txtContent = `Grocery List: ${list.name}\n` +
        `Exported: ${new Date().toLocaleString()}\n` +
        `Total Items: ${exportData.total_items}\n` +
        `Checked Items: ${exportData.checked_items}\n\n` +
        (list.grocery_list_items || []).map((item: any, index: number) => 
          `${index + 1}. ${item.name}${item.quantity ? ` (${item.quantity}${item.unit ? ` ${item.unit}` : ''})` : ''}${item.is_checked ? ' ✓' : ''}`
        ).join('\n');
      
      return new NextResponse(txtContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="grocery-list-${list.name.replace(/[^a-zA-Z0-9]/g, '-')}.txt"`
        }
      });
    } else {
      // Default to JSON
      return NextResponse.json({
        ...exportData,
        format: 'json',
        success: true
      });
    }

  } catch (error) {
    console.error('Error in grocery list export:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
