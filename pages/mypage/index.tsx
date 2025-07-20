import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyProperties from '../../libs/components/mypage/MyProperties';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import AddProperty from '../../libs/components/mypage/AddNewProperty';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyArticles from '../../libs/components/mypage/MyArticles';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import MyMenu from '../../libs/components/mypage/MyMenu';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';

export const getStaticProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common'])),
    },
});

const MyPage: NextPage = () => {
    const device = useDeviceDetect();
    const user = useReactiveVar(userVar);
    const router = useRouter();
    const category: any = router.query?.category ?? 'myProfile';

    /** APOLLO REQUESTS **/
    const [subscribe] = useMutation(SUBSCRIBE);
    const [unsubscribe] = useMutation(UNSUBSCRIBE);
    const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

    /** LIFECYCLES **/
    useEffect(() => {
        if (!user._id) {
            console.log('User not logged in, redirecting to home page.');
            router.push('/').then();
        }
    }, [user]);

    /** HANDLERS **/
const subscribeHandler = async (id: string, refetch: any, query: any) => {
  try {
    console.log('Subscribing to member with ID:', id); // Log the ID
    if (!id) throw new Error(Messages.error1);
    if (!user._id) throw new Error(Messages.error2);
    await subscribe({ variables: { input: id } });
    await sweetTopSmallSuccessAlert('Subscribed successfully', 800);
    await refetch({ input: query });
  } catch (err: any) {
    console.error('Error subscribing to member:', err);
    sweetErrorHandling(err).then();
  }
};

    const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
        try {
            console.log('Unsubscribing from member with ID:', id);
            if (!id) throw new Error(Messages.error1);
            if (!user._id) throw new Error(Messages.error2);
            await unsubscribe({ variables: { input: id } });
            await sweetTopSmallSuccessAlert('Unsubscribed successfully', 800);
            await refetch({ input: query });
        } catch (err: any) {
            console.error('Error unsubscribing from member:', err);
            sweetErrorHandling(err).then();
        }
    };

    const likeMemberHandler = async (id: string, refetch: any, query: any) => {
        try {
            console.log('Liking member with ID:', id);
            if (!id) return;
            if (!user._id) throw new Error(Messages.error2);
            await likeTargetMember({ variables: { input: id } });
            await sweetTopSmallSuccessAlert('Liked successfully', 800);
            await refetch({ input: query });
        } catch (err: any) {
            console.error('Error liking target member:', err);
            sweetErrorHandling(err).then();
        }
    };

    const redirectToMemberPageHandler = async (memberId: string) => {
        try {
            console.log('Redirecting to member page with ID:', memberId);
            if (memberId === user?._id) {
                await router.push(`/mypage?memberId=${memberId}`);
            } else {
                await router.push(`/member?memberId=${memberId}`);
            }
        } catch (error) {
            console.error('Error redirecting to member page:', error);
            await sweetErrorHandling(error);
        }
    };

    if (device === 'mobile') {
        return <div>MY PAGE</div>;
    } else {
        return (
            <div id="my-page" style={{ position: 'relative' }}>
                <div className="container">
                    <Stack className={'my-page'}>
                        <Stack className={'back-frame'}>
                            <Stack className={'left-config'}>
                                <MyMenu />
                            </Stack>
                            <Stack className="main-config" mb={'76px'}>
                                <Stack className={'list-config'}>
                                    {category === 'addProperty' && <AddProperty />}
                                    {category === 'myProperties' && <MyProperties />}
                                    {category === 'myFavorites' && <MyFavorites />}
                                    {category === 'recentlyVisited' && <RecentlyVisited />}
                                    {category === 'myArticles' && <MyArticles />}
                                    {category === 'writeArticle' && <WriteArticle />}
                                    {category === 'myProfile' && <MyProfile />}
                                    {category === 'followers' && (
                                        <MemberFollowers
                                            subscribeHandler={subscribeHandler}
                                            unsubscribeHandler={unsubscribeHandler}
                                            likeMemberHandler={likeMemberHandler}
                                            redirectToMemberPageHandler={redirectToMemberPageHandler}
                                        />
                                    )}
                                    {category === 'followings' && (
                                        <MemberFollowings
                                            subscribeHandler={subscribeHandler}
                                            unsubscribeHandler={unsubscribeHandler}
                                            likeMemberHandler={likeMemberHandler}
                                            redirectToMemberPageHandler={redirectToMemberPageHandler}
                                        />
                                    )}
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                </div>
            </div>
        );
    }
};

export default withLayoutBasic(MyPage);