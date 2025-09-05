import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:8080";

export const useBet = () => {
    return useMutation({
        mutationFn: async ({ address, transactionHash }: { address: string; transactionHash: string }) => {
            const { data } = await axios.post(`${API_BASE}/bet`, {
                address,
                transactionHash,
            });
            return data;
        },
        onSuccess: (data) => {
            toast.success("Earned 10 points");
            console.log("Updated user:", data);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || "❌ Failed to place bet");
        },
    });
};

export const useLeaderboard = () => {
    return useQuery({
        queryKey: ["leaderboard"],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE}/leaderboard`);
            return res.data;
        },
    });
};