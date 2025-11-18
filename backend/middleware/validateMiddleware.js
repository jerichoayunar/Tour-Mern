// middleware/validateMiddleware.js - UPDATED FOR FORMDATA
export const validateRequest = (schema) => (req, res, next) => {
  // Parse FormData fields before validation
  const parsedBody = { ...req.body };
  
  // Parse itinerary if it's a JSON string
  if (parsedBody.itinerary && typeof parsedBody.itinerary === 'string') {
    try {
      parsedBody.itinerary = JSON.parse(parsedBody.itinerary);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid itinerary format',
      });
    }
  }
  
  // Parse number fields
  if (parsedBody.price && typeof parsedBody.price === 'string') {
    parsedBody.price = Number(parsedBody.price);
  }
  if (parsedBody.duration && typeof parsedBody.duration === 'string') {
    parsedBody.duration = Number(parsedBody.duration);
  }
  
  // Parse boolean fields
  if (typeof parsedBody.transport === 'string') {
    parsedBody.transport = parsedBody.transport === 'true';
  }
  if (typeof parsedBody.meals === 'string') {
    parsedBody.meals = parsedBody.meals === 'true';
  }
  if (typeof parsedBody.stay === 'string') {
    parsedBody.stay = parsedBody.stay === 'true';
  }
  
  // Validate the parsed data
  const { error } = schema.validate(parsedBody);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  
  // Replace req.body with parsed data for the service
  req.body = parsedBody;
  next();
};