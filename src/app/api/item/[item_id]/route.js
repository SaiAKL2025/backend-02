import { getClientPromise } from "@/lib/mongodb";
import {
  errorResponse,
  printExceptionLog,
  successResponse,
} from "@/lib/utils";
import { ObjectId } from "mongodb";
import corsHeaders from "@/lib/cors";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request, { params }) {
  const { item_id } = await params;

  try {
    if (!ObjectId.isValid(item_id)) {
      return errorResponse("Invalid item ID", 400);
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const item = await db.collection("item").findOne({
      _id: new ObjectId(item_id),
      status: {
        $ne: "DELETED",
      },
    });

    if (!item) {
      return errorResponse("Item not found", 404);
    }

    return successResponse({ item }, 200);
  } catch (error) {
    printExceptionLog("GET Item", error);
    return errorResponse("GET Item Internal Error", 500);
  }
}

export async function PUT(request, { params }) {
  const { item_id } = await params;

  try {
    if (!ObjectId.isValid(item_id)) {
      return errorResponse("Invalid item ID", 400);
    }

    const data = await request.json();

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const updateResult = await db.collection("item").updateOne(
      {
        _id: new ObjectId(item_id),
        status: {
          $ne: "DELETED",
        },
      },
      {
        $set: {
          name: data.name,
          category: data.category,
          price: data.price,
          amount: data.amount,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return errorResponse("Item not found", 404);
    }

    if (updateResult.modifiedCount === 0) {
      return successResponse(
        {
          message: "No item information was changed",
        },
        200
      );
    }

    return successResponse(
      {
        message: "Item update success",
      },
      200
    );
  } catch (error) {
    printExceptionLog("PUT Item", error);
    return errorResponse("PUT Item Internal Error", 500);
  }
}

export async function DELETE(request, { params }) {
  const { item_id } = await params;

  try {
    if (!ObjectId.isValid(item_id)) {
      return errorResponse("Invalid item ID", 400);
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    const deleteResult = await db.collection("item").updateOne(
      {
        _id: new ObjectId(item_id),
        status: {
          $ne: "DELETED",
        },
      },
      {
        $set: {
          status: "DELETED",
        },
      }
    );

    if (deleteResult.matchedCount === 0) {
      return errorResponse("Item not found or already deleted", 404);
    }

    return successResponse(
      {
        message: "Item soft delete success",
      },
      200
    );
  } catch (error) {
    printExceptionLog("DELETE Item", error);
    return errorResponse("DELETE Item Internal Error", 500);
  }
}