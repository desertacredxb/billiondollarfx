import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/services/ai.service";

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: "Message is required." },
                { status: 400 }
            );
        }

        const reply = await generateResponse({
            message,
        });
        return NextResponse.json({
            success: true,
            reply,
        });
    } catch (error) {
        console.error("Chat API Error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}