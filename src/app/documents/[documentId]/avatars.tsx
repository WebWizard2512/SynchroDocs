"use client";

import { useOthers,useSelf } from "@liveblocks/react/suspense";
import { ClientSideSuspense } from "@liveblocks/react";
import { Separator } from "@/components/ui/separator";
const AVATAR_SIZE = 36;

export const Avatars = () => {
    return (
        <ClientSideSuspense fallback={null}>
            <AvatarStack />
        </ClientSideSuspense>
    );
};

const AvatarStack = () => {
    const users = useOthers();
    const currentUSer = useSelf();

    if(users.length === 0) return null;

    return (
        <>
            <div className="flex items-center">
                {currentUSer && (
                    <div className="relative ml-2">
                         <Avatar src={currentUSer.info.avatar} name="You"/>
                    </div>
                )}
                <div className="flex">
                    {users.map(({connectionId, info}) => {
                        return (
                            <Avatar key={connectionId} src={info.avatar} name={info.name} />
                        )
                    })}
                </div>
            </div>
            <Separator orientation="vertical" className="h-6"/>
        </>
    )
}

interface AvatarProps{
    src: string;
    name: string;  
}

const Avatar = ({src, name}: AvatarProps) => {
    return (
        <div 
        style={{width: AVATAR_SIZE, height: AVATAR_SIZE}}
        className="group -ml-2 flex shrink-0 place-content-center relative border-4 border-white rounded-full bg-gray-400">
            <div className="opacity-0 group-hover:opacity-100 absolute top-full whitespace-nowrap bg-black text-white text-xs rounded-lg px-2 py-1 mt-2.5 z-10 transition-opacity">
                {name}
            </div>
            <img
            alt={name}
            src={src}
            className="size-full rounded-full"/>
        </div>    
    );
};