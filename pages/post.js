import { auth, db } from "../utils/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import Router, { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function Post() {
    //Form state
    const [ post, setPost ] = useState({ description: "" });
    const [ user, loading ] = useAuthState(auth);
    const route = useRouter();

    const routeData = route.query;
    //Create post
    const submitPost = async (e) => {
        e.preventDefault();

        //Run check for post data
        if(!post.description){
            toast.error("Fillup the post description!", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 1500,
            });
            return;
        }

        if(post.description.length > 400){
            toast.error("Description is too long!", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 1500,
            });
            return;
        }

        if(post?.hasOwnProperty("id")){
            const docRef = doc(db, "posts", post.id);
            const updatedPost = { ...post, timestamp: serverTimestamp() };
            await updateDoc(docRef, updatedPost);
            toast.success("Save changes!", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 1500,
            });
            return route.push('/dashboard');
        }else{

            //Make new post
            const collectionRef = collection(db, 'posts');
            await addDoc(collectionRef, {
                ...post,
                timestamp: serverTimestamp(),
                user: user.uid,
                avatar: user.photoURL,
                username: user.displayName,
            });
            setPost({ description: "" });
            toast.success("Post has been made", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 1500,
            });
            return Router.push('/');
        }
    }

    //Check our user
    const checkUser = async () => {
        if(loading) return;
        if(!user) route.push("/auth/login");
        if(routeData.id){
            setPost({description: routeData.description, id: routeData.id });
        }
    }

    useEffect(() => {
        checkUser();
    }, [user, loading]);

    return (
        <div className="my-10 p-8 shadow-lg rounded-2xl max-w-2xl mx-auto">
            <form onSubmit={submitPost}>
                <h1 className="text-xl font-semibold">{post.hasOwnProperty("id") ? "Edit your post" : "Create a new post"}</h1>
                <div className="py-2">
                    <h3 className="text-lg font-medium py-2">Description</h3>
                    <textarea 
                        name="description" 
                        value={post.description}
                        onChange={(e) => setPost({ ...post, description: e.target.value})}
                        placeholder="Post description"
                        className="bg-gray-800 h-32 w-full text-white rounded-lg p-2 text-sm font-thin"
                    >
                    </textarea>
                    <p 
                        className={`text-blue-600 font-medium text-sm ${post.description.length > 400 ? "text-rose-600" : ""}`}
                    >
                        { post.description.length}/400
                    </p>
                </div>
                <button
                    className="py-2 px-4 rounded-lg text-medium text-white bg-blue-600 hover:bg--blue-500"
                >
                    {post.hasOwnProperty("id") ? "Save" : "Create"}
                </button>
            </form>
        </div>
    )
}
