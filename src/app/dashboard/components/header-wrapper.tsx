import { getSession } from "@/lib/sessions"
import { Header } from "./header"

export async function HeaderWrapper() {
	const session = await getSession()
	return <Header isAdmin={session.isAdmin ?? false} />
}
