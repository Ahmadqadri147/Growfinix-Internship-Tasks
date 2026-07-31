import client from "./client";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function createPaymentIntent(data: {
  bookingId: string;
  amount: number;
}): Promise<{ clientSecret: string }> {
  const { data: response } = await client.post<ApiResponse<{ clientSecret: string }>>(
    "/payments/create-intent",
    data,
  );
  return response.data;
}

export async function confirmPayment(bookingId: string): Promise<{ success: boolean }> {
  const { data } = await client.post<ApiResponse<{ success: boolean }>>(
    `/payments/${bookingId}/confirm`,
  );
  return data.data;
}

export async function getPaymentStatus(
  bookingId: string,
): Promise<{ status: string }> {
  const { data } = await client.get<ApiResponse<{ status: string }>>(
    `/payments/${bookingId}/status`,
  );
  return data.data;
}
