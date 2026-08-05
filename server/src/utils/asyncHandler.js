export const asyncHandler = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            console.log("AsyncHandler error", error);
            
            res.status(error?.statusCode || 500).json({
                statusCode: error.statusCode || 500,
                message: error?.message || "Internal server error",
            })
        }
    }
}
