import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById, incrementFileCount } from "@/lib/auth"
import { mergePDFs, markdownToPDF, pptxToPDF } from "@/lib/pdf-processor"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = await verifyToken(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check usage limits
    if (user.plan === "free" && user.filesProcessedToday >= 5) {
      return NextResponse.json(
        { error: "Daily limit reached. Upgrade to Pro for unlimited processing." },
        { status: 403 },
      )
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const action = formData.get("action") as string

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    let processedPdf: Uint8Array

    // Process files based on action
    switch (action) {
      case "merge":
        processedPdf = await mergePDFs(files)
        break
      case "markdown":
        processedPdf = await markdownToPDF(files)
        break
      case "pptx":
        processedPdf = await pptxToPDF(files)
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Log file processing
    for (const file of files) {
      await sql`
        INSERT INTO file_logs (user_id, file_name, file_size, action, status)
        VALUES (${userId}, ${file.name}, ${file.size}, ${action}, 'completed')
      `
    }

    // Increment user's file count
    await incrementFileCount(userId)

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
    const filename = `${action}_${timestamp}.pdf`

    return new NextResponse(processedPdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": processedPdf.length.toString(),
      },
    })
  } catch (error) {
    console.error("File processing error:", error)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}
