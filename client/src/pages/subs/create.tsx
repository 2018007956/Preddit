import InputGroup from "@/src/components/InputGroup";
import axios from "axios";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { mutate } from "swr";

const SubCreate = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<any>({});
    let router = useRouter();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        try {
            const res = await axios.post("/subs", {name, description})
            mutate("/subs/sub/topSubs");
            router.push(`/r/${res.data.name}`);
        } catch (error: any) {
            console.log(error);
            setErrors(error.response.data);
        }
    }

    return (
        <div className="flex pl-60 pt-24">
            <div className="w-[500px] p-4 bg-white rounded border border-gray-300">
                <h1 className="mb-1 text-lg font-medium">
                    Tell us about your community
                </h1>
                <p className="mb-2 text-xs text-gray-400">
                    A name and description help people understand what your community is all about
                </p>
                <hr />
                <form onSubmit={handleSubmit}>
                    <div className="my-6 text-black">
                        <InputGroup
                            placeholder="Community name"
                            value={name}
                            setValue={setName}
                            error={errors.name}
                        />
                    </div>
                    <div className="my-6 text-black">
                        <InputGroup
                            placeholder="Description"
                            value={description}
                            setValue={setDescription}
                            error={errors.description}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button className="px-4 py-1 text-sm font-semibold rounded-full text-white bg-gray-400 border">
                            Create Community
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubCreate;

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
    try {
        const cookie = req.headers.cookie;
        // 요청을 보낼 때 쿠키가 없다면 에러 보내기
        if (!cookie) throw new Error("Missing auth token cookie");

        // 쿠키가 있다면 그 쿠키를 이용해서 백엔드에서 인증 처리
        await axios.get(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/api/auth/me`, { headers: { cookie } });

        return { props: {} };
    } catch (error) {
        // 백엔드에서 요청에서 던져준 쿠키를 이용해 인증 처리할 떄 에러가 나면 /login 페이지로 이동
        res.writeHead(307, { Location: "/login" }).end();
        return { props: {} };
    }
}