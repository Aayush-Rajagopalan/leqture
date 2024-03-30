import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { getUserSubscriptionPlan } from "@/lib/stripe/subscription";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { name } = await req.json();
        const { session } = await getUserAuth();

        if (!name) {
            return new NextResponse("Bad Request", { status: 400 })
        }

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { isSubscribed } = await getUserSubscriptionPlan();

        const lectureCount = await db.lecture.count({
            where: {
                userId: session.user.id
            }
        });

        if (!isSubscribed && lectureCount >= 3) {
            return new NextResponse("Upgrade", { status: 401 })
        }


        const res = await db.lecture.create({
            data: {
                title: name,
                userId: session.user.id
            }
        });
        return NextResponse.json(res)
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const { title, id } = await req.json();
        const { session } = await getUserAuth();

        if (!title || !id) {
            return new NextResponse("Bad Request", { status: 400 })
        }
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const res = await db.lecture.update({
            where: { id: id, userId: session.user.id },
            data: { title }
        });
        console.log(res);
        return NextResponse.json(res)
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        const { session } = await getUserAuth();

        if (!id) {
            return new NextResponse("Bad Request", { status: 400 })
        }
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const res = await db.lecture.delete({
            where: { id: id, userId: session.user.id }
        });
        console.log(res);
        return NextResponse.json(res)
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
