import VerifyForm from "./VerifyForm";

type Props = {
  searchParams: Record<string, string> | Promise<Record<string, string>>;
};

export default async function verifyPhonePage({ searchParams }: Props) {
  const params = await searchParams;
  const phoneNumber = params?.phone;
  if (!phoneNumber) return <p>Invalid request to verify</p>;

  return (
    <div className="flex-col justify-center items-center md:w-[50%] lg:w-[35%]">
      <h1 className="text-center text-3xl md:text-6xl lg:text-3xl font-semibold text-[#1E88E5] mb-6">
        Verify Phone
      </h1>
      <VerifyForm phone={phoneNumber} />
    </div>
  );
}
