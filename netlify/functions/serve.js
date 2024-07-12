import { serve } from "../../dist/serve.js";

export const config = {
	preferStatic: true,
	path: ["/", "/*"],
};

export default serve;
