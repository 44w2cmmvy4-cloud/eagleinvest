<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth as FirebaseAuth;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;
use Kreait\Firebase\Exception\AuthException;

class FirebaseService
{
    protected FirebaseAuth $auth;

    public function __construct()
    {
        try {
            $factory = (new Factory)
                ->withServiceAccount(config('firebase.credentials'));

            $this->auth = $factory->createAuth();
        } catch (\Exception $e) {
            \Log::error('Firebase initialization failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Verify Firebase ID token from client
     *
     * @param string $idToken
     * @return array User data from Firebase
     * @throws FailedToVerifyToken
     */
    public function verifyIdToken(string $idToken): array
    {
        try {
            $verifiedIdToken = $this->auth->verifyIdToken($idToken);
            
            return [
                'uid' => $verifiedIdToken->claims()->get('sub'),
                'phone_number' => $verifiedIdToken->claims()->get('phone_number'),
                'email' => $verifiedIdToken->claims()->get('email'),
                'email_verified' => $verifiedIdToken->claims()->get('email_verified'),
            ];
        } catch (FailedToVerifyToken $e) {
            \Log::error('Firebase token verification failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get user by phone number
     *
     * @param string $phoneNumber
     * @return array|null
     */
    public function getUserByPhoneNumber(string $phoneNumber): ?array
    {
        try {
            $user = $this->auth->getUserByPhoneNumber($phoneNumber);
            
            return [
                'uid' => $user->uid,
                'phone_number' => $user->phoneNumber,
                'email' => $user->email,
                'disabled' => $user->disabled,
            ];
        } catch (AuthException $e) {
            \Log::warning('User not found by phone: ' . $phoneNumber);
            return null;
        }
    }

    /**
     * Get user by UID
     *
     * @param string $uid
     * @return array|null
     */
    public function getUserByUid(string $uid): ?array
    {
        try {
            $user = $this->auth->getUser($uid);
            
            return [
                'uid' => $user->uid,
                'phone_number' => $user->phoneNumber,
                'email' => $user->email,
                'disabled' => $user->disabled,
            ];
        } catch (AuthException $e) {
            \Log::warning('User not found by UID: ' . $uid);
            return null;
        }
    }

    /**
     * Create custom token for user
     *
     * @param string $uid
     * @param array $claims
     * @return string
     */
    public function createCustomToken(string $uid, array $claims = []): string
    {
        return $this->auth->createCustomToken($uid, $claims)->toString();
    }

    /**
     * Disable user account
     *
     * @param string $uid
     * @return bool
     */
    public function disableUser(string $uid): bool
    {
        try {
            $this->auth->disableUser($uid);
            return true;
        } catch (AuthException $e) {
            \Log::error('Failed to disable user: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Enable user account
     *
     * @param string $uid
     * @return bool
     */
    public function enableUser(string $uid): bool
    {
        try {
            $this->auth->enableUser($uid);
            return true;
        } catch (AuthException $e) {
            \Log::error('Failed to enable user: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete user account
     *
     * @param string $uid
     * @return bool
     */
    public function deleteUser(string $uid): bool
    {
        try {
            $this->auth->deleteUser($uid);
            return true;
        } catch (AuthException $e) {
            \Log::error('Failed to delete user: ' . $e->getMessage());
            return false;
        }
    }
}
