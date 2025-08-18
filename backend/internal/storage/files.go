package storage

import (
	"crypto/md5"
	"fmt"
)

// ProfilePictureService handles profile picture generation using Gravatar identicons
type ProfilePictureService struct{}

// NewProfilePictureService creates a new profile picture service
func NewProfilePictureService() *ProfilePictureService {
    return &ProfilePictureService{}
}

// GetDefaultProfilePicture generates a deterministic default profile picture using Gravatar identicons
// This creates unique geometric patterns for each username, perfect for default avatars
func (pps *ProfilePictureService) GetDefaultProfilePicture(username string) string {
    hash := md5.Sum([]byte(username))
    return fmt.Sprintf("https://www.gravatar.com/avatar/%x?d=identicon&s=200", hash)
}
