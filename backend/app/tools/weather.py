"""
Weather tool using WeatherAPI.com.
"""
from dotenv import load_dotenv
import os

load_dotenv()


import requests
from typing import Dict, Any

# Weather API configuration
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
WEATHER_URL = "http://api.weatherapi.com/v1/current.json"

def get_weather(city: str) -> str:
    """
    Get current weather for a city.
    
    Args:
        city: City name (e.g., "London", "New York")
    
    Returns:
        Weather information as string
    """
    try:
        # Make API request
        params = {
            "key": WEATHER_API_KEY,
            "q": city,
            "aqi": "no"
        }
        
        response = requests.get(WEATHER_URL, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract weather info
            location = data['location']['name']
            country = data['location']['country']
            temp_c = data['current']['temp_c']
            temp_f = data['current']['temp_f']
            condition = data['current']['condition']['text']
            humidity = data['current']['humidity']
            wind_kph = data['current']['wind_kph']
            feelslike_c = data['current']['feelslike_c']
            
            # Return formatted weather with context
            return (
                f"Current weather in {location}, {country}:\n"
                f"• Temperature: {temp_c}°C ({temp_f}°F)\n"
                f"• Feels like: {feelslike_c}°C\n"
                f"• Condition: {condition}\n"
                f"• Humidity: {humidity}%\n"
                f"• Wind: {wind_kph} km/h"
            )
        else:
            return f"I couldn't find weather information for '{city}'. Please check the city name and try again."
            
    except requests.exceptions.Timeout:
        return "Weather service is currently slow. Please try again in a moment."
    except requests.exceptions.RequestException as e:
        return f"Unable to fetch weather data at the moment: {str(e)}"

# Tool definition for LLM
weather_tool = {
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather information for a city. Use this when someone asks about weather, temperature, or conditions in a specific location.",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "The city name (e.g., 'London', 'New York', 'Tokyo')"
                }
            },
            "required": ["city"]
        }
    }
}