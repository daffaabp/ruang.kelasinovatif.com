"use server";

import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import * as XLSX from 'xlsx';

export const exportUsersToExcelAction = actionClient
    .schema(z.object({}))
    .action(async () => {
        try {
            // 1. Query all users dengan JOIN ke UserProfile
            const users = await prisma.user.findMany({
                include: {
                    UserProfile: true,
                    UserCourses: {
                        select: { id: true }
                    },
                    tokens: {
                        where: { type: "EMAIL_VERIFICATION" },
                        select: { id: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            // 2. Format data untuk Excel
            const exportData = users.map((user, index) => ({
                'No': index + 1,
                'Nama Lengkap': user.UserProfile[0]
                    ? `${user.UserProfile[0].firstName} ${user.UserProfile[0].lastName}`.trim()
                    : '',
                'First Name': user.UserProfile[0]?.firstName || '',
                'Last Name': user.UserProfile[0]?.lastName || '',
                'Email': user.email,
                'Phone': user.UserProfile[0]?.phone || '',
                'Institution': user.UserProfile[0]?.institution || '',
                'Address': user.UserProfile[0]?.address || '',
                'City': user.UserProfile[0]?.city || '',
                'Province': user.UserProfile[0]?.province || '',
                'Created At': new Date(user.createdAt).toLocaleDateString('id-ID'),
                'Status Admin': user.tokens.length > 0 ? 'Yes' : 'No',
                'Total Courses': user.UserCourses.length
            }));

            // 3. Generate Excel workbook
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Users Data");

            // 4. Convert to buffer
            const excelBuffer = XLSX.write(wb, {
                bookType: 'xlsx',
                type: 'buffer'
            });

            // 5. Convert buffer to base64 untuk transfer
            const base64 = Buffer.from(excelBuffer).toString('base64');

            return {
                success: true,
                data: base64,
                filename: `users-export-${new Date().toISOString().split('T')[0]}.xlsx`,
                totalUsers: users.length
            };

        } catch (error) {
            console.error('Export users error:', error);
            return {
                success: false,
                error: 'Failed to export users data'
            };
        }
    }); 