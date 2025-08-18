# Gravatar Identicon Profile Pictures

The system uses **Gravatar Identicons** for automatic default profile pictures!

## How It Works

When a user registers, the system automatically:

1. Generates an MD5 hash from their username
2. Creates a unique Gravatar identicon URL: `https://www.gravatar.com/avatar/{hash}?d=identicon&s=200`
3. Assigns this URL as their profile picture

This provides **truly unique geometric pattern avatars** for each user based on their username.

## Gravatar Identicon Features

- ✅ **Unique**: Every username gets a different geometric pattern
- ✅ **Deterministic**: Same username always gets the same avatar
- ✅ **No Storage**: Images hosted by Gravatar's reliable CDN
- ✅ **Scalable**: Parameter `s=200` sets size to 200x200 pixels
- ✅ **Zero Maintenance**: No local files to manage

## Example URLs

- Username `john_doe` → `https://www.gravatar.com/avatar/88773a5342684a9223538352aac9add9?d=identicon&s=200`
- Username `alice` → `https://www.gravatar.com/avatar/6384e2b2184bcbf58eccf10ca7a6563c?d=identicon&s=200`
- Username `holi` → `https://www.gravatar.com/avatar/8c416c2812ed806acb66520086da8972?d=identicon&s=200`
